// Kagaz score: node score.mjs <film-dir>
// Synthesizes a lo-fi beat and paper/pencil SFX on the film's beat grid, ducks them under the
// voiceover, and writes <film-dir>/beats.json and <film-dir>/audio/audio.wav at -14 LUFS.
// Reads vo.json and the film's timeline.js (build(vo) -> { beat, dur, T, sfx }).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const film = resolve(process.argv[2] ?? '');
const vo = JSON.parse(readFileSync(join(film, 'vo.json'), 'utf8'));
const { build } = await import(pathToFileURL(join(film, 'timeline.js')).href);
const { beat, dur, T, sfx, full } = build(vo);
const SR = 48000;
const N = Math.round(dur * SR);
const TAU = Math.PI * 2;

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20261008);
const noise = () => rnd() * 2 - 1;
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

const bus = () => [new Float32Array(N), new Float32Array(N)];
const music = bus();
const fx = bus();
function put(b, t, mono, gain = 1, pan = 0) {
  const at = Math.round(t * SR);
  const l = gain * Math.min(1, 1 - pan);
  const r = gain * Math.min(1, 1 + pan);
  for (let i = 0; i < mono.length && at + i < N; i++) {
    if (at + i < 0) continue;
    b[0][at + i] += mono[i] * l;
    b[1][at + i] += mono[i] * r;
  }
}
const make = (len, f) => Float32Array.from({ length: Math.round(len * SR) }, (_, i) => f(i / SR, i));
// State-variable band-pass over white noise; fc may change over time.
function bandNoise(len, fc, q = 1) {
  let lp = 0;
  let bp = 0;
  return make(len, (t) => {
    const f = 2 * Math.sin((Math.PI * fc(t)) / SR);
    lp += f * bp;
    const hp = noise() - lp - bp / q;
    bp += f * hp;
    return bp;
  });
}

// ---------- instruments ----------
const rhodes = (m, len, vel) => {
  const f = hz(m);
  return make(len, (t) => {
    const env = Math.min(1, t / 0.004) * Math.exp(-t * 2.4) * Math.min(1, (len - t) / 0.05);
    const tine = 0.07 * Math.sin(TAU * f * 4 * t) * Math.exp(-t * 20);
    return (Math.sin(TAU * f * t + 0.7 * Math.exp(-t * 5) * Math.sin(TAU * f * t)) + tine) * env * vel * (1 + 0.1 * Math.sin(TAU * 4.6 * t));
  });
};
const bass = (m, len, vel) => {
  const f = hz(m);
  return make(len, (t) => Math.tanh(1.6 * (Math.sin(TAU * f * t) + 0.35 * Math.sin(TAU * 2 * f * t))) * Math.min(1, t / 0.008) * Math.exp(-t * 3.2) * vel);
};
const kick = () => {
  let ph = 0;
  return make(0.32, (t) => {
    ph += (TAU * (46 + 95 * Math.exp(-t * 30))) / SR;
    return Math.sin(ph) * Math.exp(-t * 10) + noise() * 0.12 * Math.exp(-t * 180);
  });
};
const snare = () => {
  const n = bandNoise(0.2, () => 1900, 0.8);
  return n.map((x, i) => x * 0.9 * Math.exp((-i / SR) * 24) + 0.35 * Math.sin((TAU * 185 * i) / SR) * Math.exp((-i / SR) * 34));
};
const hat = () => {
  let prev = 0;
  return make(0.06, (t) => {
    const x = noise();
    const y = x - prev;
    prev = x;
    return y * 0.5 * Math.exp(-t * 85);
  });
};

// ---------- sound effects ----------
const thud = () => {
  let ph = 0;
  let lp = 0;
  return make(0.28, (t) => {
    ph += (TAU * (50 + 70 * Math.exp(-t * 26))) / SR;
    lp += 0.2 * (noise() - lp);
    return Math.sin(ph) * Math.exp(-t * 15) * 0.9 + lp * Math.exp(-t * 55) * 0.9;
  });
};
const SFX = {
  thud,
  paper: () => bandNoise(0.16, () => 2600, 0.7).map((x, i) => x * 0.55 * Math.exp((-i / SR) * 30)),
  swipe: (d = 0.2) => bandNoise(d, (t) => 700 + 2600 * (t / d), 1.4).map((x, i, a) => x * 0.6 * Math.sin((Math.PI * i) / a.length) ** 1.5),
  scratch: (d = 0.5) => {
    const ph = rnd() * 6;
    return bandNoise(d, () => 3600, 1.1).map((x, i, a) => {
      const t = i / SR;
      return x * 0.26 * Math.sin(TAU * 13 * t + ph) ** 2 * (0.6 + 0.4 * Math.sin(TAU * 3.1 * t + ph)) * Math.min(1, t / 0.03, (a.length - i) / SR / 0.05);
    });
  },
  whoosh: (d = 0.7) => bandNoise(d, (t) => 260 + 2300 * (t / d) ** 2, 1.3).map((x, i, a) => x * 0.6 * Math.sin((Math.PI * i) / a.length) ** 2),
  pop: () => {
    let ph = 0;
    return make(0.09, (t) => {
      ph += (TAU * (420 + 520 * (t / 0.09))) / SR;
      return Math.sin(ph) * Math.exp(-t * 38) * 0.5;
    });
  },
  stamp: () => thud().map((x, i) => x * 1.1 + noise() * 0.35 * Math.exp((-i / SR) * 220)),
  tick: () => make(0.035, (t) => Math.sin(TAU * 2100 * t) * Math.exp(-t * 170) * 0.3),
  ding: () => make(1.5, (t) => (Math.sin(TAU * 1318.5 * t) + 0.5 * Math.sin(TAU * 1975.5 * t) + 0.22 * Math.sin(TAU * 2637 * t)) * Math.exp(-t * 3.4) * Math.min(1, t / 0.003) * 0.26),
};
// ---------- recorded sound effects (optional library) ----------
// sfx/<cue type>/*.wav|ogg|mp3|flac next to this script. When the folder for a cue type holds
// files, one of them plays instead of the synthesized effect: picked by seeded random, never the
// same file twice in a row, with a small pitch change so repeats do not sound identical.
const LIB = join(dirname(fileURLToPath(import.meta.url)), 'sfx');
const LEVEL = { thud: 0.9, paper: 0.55, swipe: 0.6, scratch: 0.3, whoosh: 0.6, pop: 0.5, stamp: 1, tick: 0.3, ding: 0.4 };
const PITCH = { ding: 0 }; // pitch spread per type; tuned sounds keep their pitch
// Recorded effects are short and peaky: at equal peaks they measured 2.9 dB quieter than the
// synthesized ones on film #02. 1.8 put them about 2 dB above; after a listen they were still
// "a bit low", so 2.8 adds another 3.8 dB (about 6 dB above the synthesized level).
const REC_GAIN = 2.8;
const library = {};
// "node score.mjs <dir> --synth" ignores the library and uses only the synthesized effects
if (existsSync(LIB) && !process.argv.includes('--synth')) {
  for (const d of readdirSync(LIB, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const files = readdirSync(join(LIB, d.name)).filter((f) => /\.(wav|ogg|mp3|flac)$/i.test(f)).sort();
    if (files.length) library[d.name] = files.map((f) => join(LIB, d.name, f));
  }
}
const decoded = new Map();
function sample(file) {
  if (!decoded.has(file)) {
    // mono 48 kHz float; leading silence cut; peak at 1
    const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], { maxBuffer: 256 * 1024 * 1024 });
    if (r.status !== 0 || r.stdout.length < 8) throw new Error(`cannot decode ${file}: ${r.stderr}`);
    const f = new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset, r.stdout.byteOffset + (r.stdout.length & ~3)));
    let a = 0;
    let peak = 0;
    for (const x of f) peak = Math.max(peak, Math.abs(x));
    while (a < f.length && Math.abs(f[a]) < 0.02 * peak) a++;
    decoded.set(file, f.subarray(Math.max(0, a - 48)).map((x) => x / (peak || 1)));
  }
  return decoded.get(file);
}
const lastPick = {};
function recorded(type, dur) {
  const files = library[type];
  if (!files) return null;
  let i = Math.floor(rnd() * files.length);
  if (files.length > 1 && i === lastPick[type]) i = (i + 1) % files.length;
  lastPick[type] = i;
  const s = sample(files[i]);
  const rate = 1 + (rnd() - 0.5) * (PITCH[type] ?? 0.12);
  // a cue with a length keeps to it; other effects are capped at 1.5 s
  const n = Math.min(Math.floor(s.length / rate), Math.round((dur ? dur * 1.15 : 1.5) * SR));
  const fade = Math.min(n, Math.round(0.04 * SR));
  const level = LEVEL[type] ?? 0.5;
  return Float32Array.from({ length: n }, (_, k) => {
    const p = k * rate;
    const j = Math.floor(p);
    const x = s[j] + ((s[Math.min(s.length - 1, j + 1)] ?? 0) - s[j]) * (p - j);
    return x * level * REC_GAIN * Math.min(1, (n - k) / fade);
  });
}
let usedRecorded = 0;
for (const s of sfx) {
  const rec = recorded(s.type, s.dur);
  if (rec) usedRecorded++;
  else if (!SFX[s.type]) { console.warn(`no sound for cue type "${s.type}"`); continue; }
  put(fx, s.t, rec ?? SFX[s.type](s.dur), s.gain ?? 1, Math.sin(s.t * 7.3) * 0.25);
}
// level of the effects bus, to compare synthesized and recorded effects
const fxDb = 10 * Math.log10(fx[0].reduce((a, x) => a + x * x, 0) / N + 1e-12);

// ---------- arrangement on the beat grid ----------
const CHORDS = [
  { notes: [50, 53, 57, 60, 64], root: 38 }, // Dm9
  { notes: [43, 53, 59, 64], root: 43 }, // G13
  { notes: [48, 52, 55, 59, 62], root: 36 }, // Cmaj9
  { notes: [45, 55, 61, 65], root: 45 }, // A7b13
];
const total = Math.round(dur / beat);
const starts = vo.lines.map((l) => Math.round(l.start / beat));
// the last chord sits on T.recap; a short outro may put it on a half beat
const endBeat = Math.abs(T.recap / beat - Math.round(T.recap / beat)) < 1e-6 ? Math.round(T.recap / beat) : T.recap / beat;
const K = kick();
const S = snare();
const H = hat();
const chord = (b, c, vel, len = 2.4) => c.notes.forEach((m, i) => put(music, b * beat + i * 0.012, rhodes(m, len, vel), 1, (i - 2) * 0.12));

starts.forEach((sb, n) => {
  const eb = n + 1 < starts.length ? starts[n + 1] : endBeat;
  // a short clip (an outro) has no intro or break: the beat runs from the first frame
  const short = dur < 15 || full; // "full: true" from a timeline: beat from the first frame (Retention rule 5)
  const intro = !short && n === 0;
  const buildUp = !short && n === 1;
  const payoff = !short && n === starts.length - 1;
  for (let b = sb; b < eb; b++) {
    const r = b - sb;
    const c = CHORDS[Math.floor(r / 2) % 4];
    const lastBeat = b === eb - 1 && !payoff;
    if (r % 2 === 0) {
      chord(b, c, intro ? 0.11 : 0.14);
      put(music, b * beat, bass(c.root, 0.9, intro ? 0.25 : 0.4));
    }
    if (r % 2 === 1 && !intro) {
      chord(b + 0.5, c, 0.06, 0.8);
      put(music, (b + 0.5) * beat, bass(c.root, 0.4, 0.26));
    }
    if (intro) continue;
    const drums = !buildUp && !(payoff && r < 2);
    if (drums && !lastBeat) {
      if (r % 4 === 0) put(music, b * beat, K, 0.8);
      if (r % 4 === 2) put(music, (b + 0.5) * beat, K, 0.62);
      if (r % 2 === 1) put(music, b * beat, S, 0.34);
    }
    if (lastBeat) {
      put(music, (b + 0.5) * beat, S, 0.2);
      put(music, (b + 0.75) * beat, S, 0.27);
    } else {
      put(music, b * beat, H, 0.3 + rnd() * 0.08, 0.3);
      put(music, (b + 0.56) * beat, H, 0.16 + rnd() * 0.08, 0.3);
    }
  }
});
// last chord and a short kick on the recap beat, then let it ring
chord(endBeat, CHORDS[2], 0.2, 3);
put(music, endBeat * beat, bass(36, 1.6, 0.45));
put(music, endBeat * beat, K, 0.7);

// vinyl crackle and tape hiss
{
  let lp = 0;
  for (let i = 0; i < N; i++) {
    lp += 0.12 * (noise() * 0.012 - lp);
    const click = rnd() < 0.00045 ? noise() * 0.09 : 0;
    music[0][i] += lp + click;
    music[1][i] += lp + (rnd() < 0.5 ? click : 0);
  }
}
// lo-fi low-pass on the music bus
for (const ch of music) {
  let a = 0;
  let b = 0;
  const k = 1 - Math.exp((-TAU * 5200) / SR);
  for (let i = 0; i < N; i++) { a += k * (ch[i] - a); b += k * (a - b); ch[i] = b; }
}

// ---------- voice track and ducking ----------
const VSR = 24000;
const voice = new Float32Array(Math.round(dur * VSR));
for (const l of vo.lines) {
  const buf = readFileSync(join(film, l.file));
  const at = Math.round(l.start * VSR);
  for (let i = 0; i < (buf.length - 44) >> 1 && at + i < voice.length; i++) voice[at + i] = buf.readInt16LE(44 + i * 2) / 32768;
}
const rms = (a) => Math.sqrt(a.reduce((s, x) => s + x * x, 0) / a.length);
const voRms = rms(voice.filter((x) => Math.abs(x) > 0.01));
const duck = new Float32Array(N);
{
  let env = 0;
  for (let i = 0; i < N; i++) {
    const v = Math.abs(voice[Math.floor((i * VSR) / SR)]) > 0.03 ? 1 : 0;
    env += (v > env ? 1 / (0.03 * SR) : -1 / (0.35 * SR));
    env = Math.min(1, Math.max(0, env));
    duck[i] = env;
  }
}
const mGain = (voRms * 10 ** (-11 / 20)) / rms(music[0].filter((x) => Math.abs(x) > 1e-4));
const fGain = (voRms * 3.2) / 0.9; // SFX peaks sit a little under the voice peaks
for (let c = 0; c < 2; c++) {
  for (let i = 0; i < N; i++) {
    const fade = Math.min(1, (N - i) / (0.5 * SR));
    music[c][i] = (music[c][i] * mGain * (1 - 0.5 * duck[i]) + fx[c][i] * fGain * 0.3 * (1 - 0.25 * duck[i])) * fade;
  }
}

function wav(chans, rate) {
  const n = chans[0].length;
  const b = Buffer.alloc(44 + n * chans.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * chans.length * 2, 4); b.write('WAVEfmt ', 8);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(chans.length, 22);
  b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate * chans.length * 2, 28); b.writeUInt16LE(chans.length * 2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(n * chans.length * 2, 40);
  for (let i = 0; i < n; i++) for (let c = 0; c < chans.length; c++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, chans[c][i])) * 32767), 44 + (i * chans.length + c) * 2);
  return b;
}
const out = join(film, 'audio');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'music.wav'), wav(music, SR));
writeFileSync(join(out, 'vo.wav'), wav([voice], VSR));
const beats = Array.from({ length: total }, (_, i) => +(i * beat).toFixed(4));
writeFileSync(join(film, 'beats.json'), JSON.stringify({ bpm: vo.bpm, beat, beats, sections: vo.lines.map((l) => ({ id: l.id, t: l.start })) }));

// ---------- mix and loudness: two-pass loudnorm to -14 LUFS ----------
const mixF = '[1:a]aresample=48000,highpass=f=75,pan=stereo|c0=c0|c1=c0[v];[0:a][v]amix=inputs=2:normalize=0';
const ff = (a) => spawnSync('ffmpeg', ['-hide_banner', '-y', '-i', join(out, 'music.wav'), '-i', join(out, 'vo.wav'), ...a], { encoding: 'utf8' });
const target = 'I=-14:TP=-1.5:LRA=11';
const p1 = ff(['-filter_complex', `${mixF},loudnorm=${target}:print_format=json`, '-f', 'null', '-']);
const m = JSON.parse(p1.stderr.slice(p1.stderr.lastIndexOf('{'), p1.stderr.lastIndexOf('}') + 1));
const p2 = ff(['-filter_complex', `${mixF},loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`, '-ar', '48000', join(out, 'audio.wav')]);
if (p2.status !== 0) throw new Error(p2.stderr.slice(-600));
const measure = () => {
  const chk = spawnSync('ffmpeg', ['-hide_banner', '-i', join(out, 'audio.wav'), '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' });
  return chk.stderr.slice(chk.stderr.lastIndexOf('Summary'));
};
let sum = measure();
// Short clips can stay under the target because their peaks hit the ceiling first:
// add the missing gain and catch the peaks with a limiter.
const short = Number(/I:\s+(-?[\d.]+) LUFS/.exec(sum)?.[1]) - -14;
if (short < -0.4) {
  const p3 = ff(['-filter_complex', `${mixF},loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,volume=${(-short).toFixed(2)}dB,alimiter=limit=0.84:level=false`, '-ar', '48000', join(out, 'audio.wav')]);
  if (p3.status !== 0) throw new Error(p3.stderr.slice(-600));
  sum = measure();
}
console.log(`beats.json: ${total} beats at ${vo.bpm} bpm`);
console.log(`audio.wav: ${/I:\s+(-?[\d.]+) LUFS/.exec(sum)?.[1]} LUFS, peak ${/Peak:\s+(-?[\d.]+) dBFS/.exec(sum)?.[1]} dBFS, ${sfx.length} sfx (${usedRecorded} recorded), effects bus ${fxDb.toFixed(1)} dB`);
