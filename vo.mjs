// Voiceover: node vo.mjs <film-dir>
// Reads <film-dir>/script.json, writes <film-dir>/vo/<id>.wav and <film-dir>/vo.json (line timings).
//
// script.json:
//   { "voice": "Orus",
//     "style": "Calm, confident explainer. Medium pace. Clear stress on the key term.",
//     "gap": 0.25,
//     "lines": [ { "id": "hook", "text": "A firewall is a filter.", "style": "optional override", "gap": 0.4 } ] }
//
// My own voice (from 2026-10-16): node vo.mjs <film-dir> --own <file or folder>
//   a folder: one recording per line, named after the line id (hook.m4a, trouble.m4a, ...);
//   one file: the whole script read in order, with a breath of about one second between lines.
//   It is cut at the longest pauses near the places where the text says each line ends.
// Any format ffmpeg reads (phone m4a, mp3, wav). The recording gets a low cut, noise reduction
// and an even level, and is then timed exactly like a synthesized take. Lines with an own take
// are marked vo/<id>.own and are never replaced by the synthesized voice; delete the .own
// files to go back to it.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const MODEL = 'google/gemini-3.8-flash-tts';
const ENDPOINT = 'https://openrouter.ai/api/v1/audio/speech';
const SILENCE = 0.004; // peak amplitude below this is silence
const PAUSE = 0.02; // peak amplitude below this is a pause between words
const PAD = 0.03; // seconds of air kept around each line
const OWN_RATE = 24000;

const filmDir = process.argv[2];
const own = process.argv.includes('--own') ? process.argv[process.argv.indexOf('--own') + 1] : null;
if (!filmDir || (process.argv.includes('--own') && !own)) {
  console.error('usage: node vo.mjs <film-dir> [--own <recording file or folder>]');
  process.exit(1);
}

function apiKey() {
  if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY;
  const m = readFileSync(join(ROOT, 'Openrouter key.txt'), 'utf8').match(/sk-or-[\w-]+/);
  if (!m) throw new Error('No sk-or-... key found in "Openrouter key.txt"');
  return m[0];
}

async function speak(input, instructions, voice, key) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, input, voice, instructions: instructions || undefined, response_format: 'pcm' }),
    });
    if (res.ok) {
      const rate = Number(/rate=(\d+)/.exec(res.headers.get('content-type') ?? '')?.[1] ?? 24000);
      return { pcm: Buffer.from(await res.arrayBuffer()), rate };
    }
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await new Promise((r) => setTimeout(r, 1500 * 2 ** attempt));
      continue;
    }
    throw new Error(`TTS ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}

// 16-bit mono PCM: cut leading/trailing silence so line durations are the spoken durations.
function trim(pcm, rate, silence = SILENCE) {
  const n = pcm.length >> 1;
  const thr = silence * 32768;
  let a = 0;
  let b = n - 1;
  while (a < n && Math.abs(pcm.readInt16LE(a * 2)) < thr) a++;
  while (b > a && Math.abs(pcm.readInt16LE(b * 2)) < thr) b--;
  const pad = Math.round(PAD * rate);
  a = Math.max(0, a - pad);
  b = Math.min(n - 1, b + pad);
  return pcm.subarray(a * 2, (b + 1) * 2);
}

function wav(pcm, rate) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

// Peak of every 10 ms of 16-bit PCM, as 0..1.
function peaks(pcm, rate) {
  const hop = Math.round(rate * 0.01);
  const n = pcm.length >> 1;
  const out = [];
  for (let i = 0; i + hop <= n; i += hop) {
    let p = 0;
    for (let k = 0; k < hop; k++) p = Math.max(p, Math.abs(pcm.readInt16LE((i + k) * 2)));
    out.push(p / 32768);
  }
  return out;
}

// A phone recording: decoded to 24 kHz mono, low cut, noise reduction, level at -16 LUFS.
function decode(file) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-af', 'highpass=f=80,afftdn=nf=-25,loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', String(OWN_RATE), '-f', 's16le', '-'], { maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`ffmpeg could not read ${file}: ${r.stderr.toString().slice(-300)}`);
  return r.stdout;
}

// The silence level of a recording: a little above its quietest stretches (room noise).
function silenceOf(pcm) {
  const p = peaks(pcm, OWN_RATE).sort((a, b) => a - b);
  const noise = p[Math.floor(p.length * 0.1)] ?? 0;
  if (noise * 3 > PAUSE) console.log(`note: the recording is noisy (room noise at ${(20 * Math.log10(noise || 1e-6)).toFixed(0)} dBFS); pauses may be missed`);
  return Math.min(PAUSE, Math.max(SILENCE, noise * 3));
}

// One recording of the whole script, cut into its lines: a cut is a long pause near the
// place where the text says the line ends (as spans() in brand/timing.js does for sentences).
function splitTake(pcm, texts) {
  const p = peaks(pcm, OWN_RATE);
  const loud = p.map((x) => x >= PAUSE);
  const first = loud.indexOf(true);
  const last = loud.lastIndexOf(true);
  const runs = [];
  let q = -1;
  for (let i = first; i <= last; i++) {
    if (!loud[i]) { if (q < 0) q = i; } else {
      if (q >= 0 && i - q >= 25) runs.push([q / 100, i / 100]);
      q = -1;
    }
  }
  const chars = texts.reduce((a, s) => a + s.length, 0);
  const span = (last - first) / 100;
  const cuts = [];
  let seen = 0;
  for (let i = 0; i < texts.length - 1; i++) {
    seen += texts[i].length;
    const expect = first / 100 + (span * seen) / chars;
    const from = cuts.length ? cuts[cuts.length - 1][1] : 0;
    const score = (r) => r[1] - r[0] - 0.35 * Math.abs((r[0] + r[1]) / 2 - expect);
    const best = runs.filter((r) => r[0] >= from).sort((x, y) => score(y) - score(x))[0];
    if (!best) throw new Error(`found only ${cuts.length + 1} of ${texts.length} lines in the take: leave about one second between lines, or record one file per line`);
    cuts.push(best);
  }
  const edges = [first / 100, ...cuts.flat(), (last + 1) / 100];
  const at = (s) => Math.round(s * OWN_RATE) * 2;
  return texts.map((_, i) => {
    const [a, b] = [edges[2 * i], edges[2 * i + 1]];
    console.log(`  line ${i + 1}: ${a.toFixed(2)}-${b.toFixed(2)} s of the take`);
    return pcm.subarray(Math.max(0, at(a - 0.1)), Math.min(pcm.length, at(b + 0.1)));
  });
}

const script = JSON.parse(readFileSync(join(filmDir, 'script.json'), 'utf8').replace(/^﻿/, ''));
const voice = own ? 'own' : (script.voice ?? 'Orus');
const outDir = join(filmDir, 'vo');
mkdirSync(outDir, { recursive: true });
let key = null;

// Import my own recording: write vo/<id>.wav and mark it vo/<id>.own.
if (own) {
  const texts = script.lines.map((l) => l.text ?? l.sentences.join(' '));
  let takes;
  if (statSync(own).isDirectory()) {
    const files = readdirSync(own);
    takes = script.lines.map((l) => {
      const f = files.find((x) => x.replace(/\.[^.]+$/, '') === l.id);
      if (!f) throw new Error(`no recording for line "${l.id}" in ${own} (name it ${l.id}.m4a or similar)`);
      return decode(join(own, f));
    });
  } else {
    console.log(`cutting ${own} into ${texts.length} lines`);
    takes = splitTake(decode(own), texts);
  }
  script.lines.forEach((l, i) => {
    const silence = silenceOf(takes[i]);
    writeFileSync(join(outDir, `${l.id}.wav`), wav(trim(takes[i], OWN_RATE, silence), OWN_RATE));
    // a synthesized take's cache mark would otherwise survive the own one
    for (const f of readdirSync(outDir)) if (f.startsWith(`${l.id}.`) && /^[0-9a-f]{10}$/.test(f.slice(l.id.length + 1))) unlinkSync(join(outDir, f));
    writeFileSync(join(outDir, `${l.id}.own`), '');
    console.log(`own   ${l.id}`);
  });
}

// Internal pauses (seconds from line start): where the voice stops and where it starts again.
function pauses(buf, rate, min = 0.13) {
  const hop = Math.round(rate * 0.01);
  const n = (buf.length - 44) >> 1;
  const out = [];
  let quiet = -1;
  for (let i = 0; i + hop <= n; i += hop) {
    let peak = 0;
    for (let k = 0; k < hop; k++) peak = Math.max(peak, Math.abs(buf.readInt16LE(44 + (i + k) * 2)));
    if (peak < PAUSE * 32768) {
      if (quiet < 0) quiet = i;
    } else {
      if (quiet > 0 && (i - quiet) / rate >= min) out.push([+(quiet / rate).toFixed(3), +(i / rate).toFixed(3)]);
      quiet = -1;
    }
  }
  return out;
}

const lines = [];
// "grid": 0.5 lets lines start on half beats (tighter gaps for short clips)
const beat = script.bpm ? (60 / script.bpm) * (script.grid ?? 1) : 0;
let t = script.start ?? 0;
for (const line of script.lines) {
  const style = line.style ?? script.style;
  const text = line.text ?? line.sentences.join(' ');
  const hash = createHash('sha1').update(`${MODEL}|${script.voice ?? 'Orus'}|${style ?? ''}|${text}`).digest('hex').slice(0, 10);
  const file = join(outDir, `${line.id}.wav`);
  const tag = join(outDir, `${line.id}.${hash}`);

  if (existsSync(join(outDir, `${line.id}.own`))) {
    if (!own) console.log(`own   ${line.id} (kept)`);
  } else if (!(existsSync(file) && existsSync(tag))) {
    // Cached when the same text, style and voice were already rendered.
    key ??= apiKey();
    const { pcm, rate } = await speak(text, style, script.voice ?? 'Orus', key);
    writeFileSync(file, wav(trim(pcm, rate), rate));
    writeFileSync(tag, '');
    console.log(`tts   ${line.id}`);
  } else {
    console.log(`cache ${line.id}`);
  }

  const buf = readFileSync(file);
  const rate = buf.readUInt32LE(24);
  const duration = (buf.length - 44) / 2 / rate;
  const ps = pauses(buf, rate);
  // My rule: a pause of more than 0.3 s inside a sentence means the take is done again.
  const n = line.sentences?.length ?? 1;
  const long = ps.filter((p) => p[1] - p[0] > 0.3);
  if (long.length > n - 1) console.log(`  note: ${line.id} has ${long.length} pauses over 0.3 s for ${n} sentence(s): listen, and take it again if one is inside a sentence`);
  // With "bpm" set, every line starts on a beat.
  if (beat) t = Math.ceil(t / beat - 1e-6) * beat;
  lines.push({
    id: line.id, text, sentences: line.sentences, file: `vo/${line.id}.wav`,
    start: +t.toFixed(3), duration: +duration.toFixed(3), pauses: ps,
  });
  t += duration + (line.gap ?? script.gap ?? 0.25);
}

const anyOwn = script.lines.some((l) => existsSync(join(outDir, `${l.id}.own`)));
writeFileSync(join(filmDir, 'vo.json'), JSON.stringify({ model: anyOwn ? 'own recording' : MODEL, voice: anyOwn ? 'own' : voice, bpm: script.bpm, total: +t.toFixed(3), lines }, null, 2));
console.log(`vo.json: ${lines.length} lines, ${t.toFixed(2)}s`);
// Reel length (my rule of 2026-10-23): 30 to 35 seconds unless I ask for a longer reel
// ("long": true in script.json). The reel runs about a second past the last line.
const reel = t + 1;
if (!script.long && (reel < 30 || reel > 35)) console.log(`  LENGTH: the reel would run about ${reel.toFixed(1)} s, outside the 30 to 35 s target: ${reel > 35 ? 'cut sentences' : 'add a beat'} and take the voice again`);
