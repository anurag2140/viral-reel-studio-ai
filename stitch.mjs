// Join a film and an outro: node stitch.mjs <film-dir> <outro.mp4> [name]
// Writes <film-dir>/<name>.mp4 (default: final). Hard cut, re-encoded once with the render settings.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const [filmDir, outro, name = 'final'] = process.argv.slice(2);
const film = join(resolve(filmDir ?? ''), 'out.mp4');
if (!filmDir || !outro || !existsSync(film) || !existsSync(outro)) {
  console.error('usage: node stitch.mjs <film-dir> <outro.mp4> [name]   (render the film first)');
  process.exit(1);
}
const out = join(resolve(filmDir), `${name}.mp4`);
const r = spawnSync('ffmpeg', [
  '-hide_banner', '-y', '-i', film, '-i', resolve(outro),
  '-filter_complex', '[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]',
  '-map', '[v]', '-map', '[a]',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', '-preset', 'slow', '-r', '30',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', out,
], { encoding: 'utf8' });
if (r.status !== 0) { console.error(r.stderr.slice(-800)); process.exit(1); }
console.log(out);
