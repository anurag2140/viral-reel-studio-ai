// node share-outro.mjs <film-dir>
// Builds the film's own share outro from the "share" sentence in its script.json, for example
//   "share": "ये उस दोस्त को भेजो जो ChatGPT use करता है।"
// Result: <film-dir>/share-outro/out.mp4. It uses the layout of short outro E (the video folds
// into a paper plane and flies to the mascot, the logo card and Follow button below).
// The plane takes off on the word "भेजो", so the sentence should contain it.
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const film = resolve(process.argv[2] ?? '');
const script = JSON.parse(readFileSync(join(film, 'script.json'), 'utf8').replace(/^﻿/, ''));
if (!script.share) {
  console.error('script.json has no "share" sentence');
  process.exit(1);
}
if (!script.share.includes('भेजो')) console.warn('The share sentence has no "भेजो": the plane will take off on the first word.');

const out = join(film, 'share-outro');
const short = join(ROOT, 'outro', 'short');
mkdirSync(out, { recursive: true });
const base = JSON.parse(readFileSync(join(short, 'e', 'script.json'), 'utf8'));
base.voice = script.voice ?? base.voice;
base.lines = [{ id: 'e', sentences: [script.share] }];
writeFileSync(join(out, 'script.json'), JSON.stringify(base, null, 2));
copyFileSync(join(short, 'e', 'film.html'), join(out, 'film.html'));
const rel = relative(out, join(short, 'timeline.js')).replaceAll('\\', '/');
writeFileSync(join(out, 'timeline.js'), `// Cue times come from the shared short-outro builder (variant E).\nexport * from '${rel}';\n`);

for (const tool of ['vo.mjs', 'score.mjs', 'render.mjs']) {
  const r = spawnSync(process.execPath, [join(ROOT, tool), out], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
const line = JSON.parse(readFileSync(join(out, 'vo.json'), 'utf8')).lines[0];
console.log(`share outro: voice ${line.duration.toFixed(2)} s, pauses ${JSON.stringify(line.pauses)}`);
if (line.duration > 2.8) console.warn('The voice line is long: the outro ask should stay near 3 seconds. Shorten the sentence.');
