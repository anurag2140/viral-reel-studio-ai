// node render.mjs <film-dir>            full render -> <film-dir>/out.mp4 (muxes audio/audio.wav when present)
// node render.mjs <film-dir> --sheet    one frame per beat -> <film-dir>/sheets/sheet-N.png
// node render.mjs <film-dir> --at 1.5,2 single frames -> <film-dir>/sheets/at-<t>.png
// node render.mjs <film-dir> --cover 0.4 the cover image for the post -> <film-dir>/cover.png
//   --series "AI जुगाड़ #1"            adds the series badge to the cover only (not to the video),
//                                     inside the 3:4 part that the profile grid shows (y 240-1680)
//   --series-at 48,292                its top-left corner, when the default covers something
import { spawn, spawnSync } from 'node:child_process';
import { createReadStream, existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const film = resolve(args[0] ?? '');
if (!args[0] || !existsSync(join(film, 'film.html'))) {
  console.error('usage: node render.mjs <film-dir> [--sheet | --at t1,t2]');
  process.exit(1);
}
const flag = (name) => args.includes(name);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const canvas = JSON.parse(readFileSync(join(ROOT, 'brand', 'brand.json'), 'utf8')).canvas;
const FPS = canvas.fps;
const WORKERS = Number(opt('--workers') ?? 4);

// The film is served over http so ES modules and fetch work.
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.wav': 'audio/wav', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  const file = join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(ROOT) || !existsSync(file) || !statSync(file).isFile()) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/${relative(ROOT, film).replaceAll('\\', '/')}/film.html?render`;

const browser = await chromium.launch();
async function openPage() {
  const page = await browser.newPage({ viewport: { width: canvas.width, height: canvas.height } });
  page.on('pageerror', (e) => { console.error('page error:', e.message); process.exitCode = 1; });
  page.on('console', (m) => { if (m.type() === 'error') console.error('console:', m.text()); });
  await page.goto(url);
  await page.waitForFunction(() => window.ready === true, null, { timeout: 30000 });
  return page;
}
async function shoot(page, t, path) {
  await page.evaluate((x) => window.seek(x), t);
  await page.screenshot({ path, clip: { x: 0, y: 0, width: canvas.width, height: canvas.height } });
}
const run = (cmd, a) => {
  const r = spawnSync(cmd, a, { stdio: ['ignore', 'ignore', 'pipe'] });
  if (r.status !== 0) throw new Error(r.stderr.toString().slice(-800));
};

const sheets = join(film, 'sheets');
if (flag('--cover')) {
  const page = await openPage();
  const t = Number(opt('--cover')) || 0.4;
  const series = opt('--series');
  if (series) {
    // the grid shows the middle 1080 x 1440 (y 240 to 1680): the badge sits at its top left
    await page.evaluate((x) => window.seek(x), t);
    const [x, y] = (opt('--series-at') ?? '48,292').split(',').map(Number);
    await page.evaluate(([label, x, y]) => {
      const b = document.createElement('div');
      b.textContent = label;
      b.style.cssText = `position:absolute;left:${x}px;top:${y}px;z-index:99;padding:30px 44px 16px;background:#FFD23F;border:7px solid #1E1410;border-radius:34px;box-shadow:0 14px 0 rgba(15,18,48,.3);font:800 84px/1 'Anek Devanagari';font-stretch:88%;color:#0F1230;white-space:nowrap;transform:rotate(-3deg)`;
      document.getElementById('stage').appendChild(b);
    }, [series, x, y]);
    await page.screenshot({ path: join(film, 'cover.png'), clip: { x: 0, y: 0, width: canvas.width, height: canvas.height } });
  } else await shoot(page, t, join(film, 'cover.png'));
  console.log(`cover.png (frame at ${t} s${series ? `, badge "${series}"` : ''})`);
} else if (flag('--at')) {
  mkdirSync(sheets, { recursive: true });
  const page = await openPage();
  const times = opt('--at').split(',').map(Number);
  if (times.length === 1) {
    await shoot(page, times[0], join(sheets, `at-${times[0].toFixed(2)}.png`));
    console.log(`at-${times[0].toFixed(2)}.png`);
  } else {
    // several times -> one tiled sheet, in the order given
    const tmp = join(film, '.frames');
    rmSync(tmp, { recursive: true, force: true });
    mkdirSync(tmp);
    for (let i = 0; i < times.length; i++) await shoot(page, times[i], join(tmp, `${String(i).padStart(5, '0')}.png`));
    run('ffmpeg', ['-y', '-i', join(tmp, '%05d.png'), '-frames:v', '1', '-vf', `scale=${canvas.width / 4}:-1,tile=8x${Math.ceil(times.length / 8)}:padding=6:color=0x222222`, join(sheets, 'at.png')]);
    rmSync(tmp, { recursive: true, force: true });
    console.log('at.png');
  }
} else if (flag('--sheet')) {
  mkdirSync(sheets, { recursive: true });
  const tmp = join(film, '.frames');
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp);
  const page = await openPage();
  const dur = await page.evaluate(() => window.DUR);
  const beats = JSON.parse(readFileSync(join(film, 'beats.json'), 'utf8')).beats.filter((t) => t < dur);
  for (let i = 0; i < beats.length; i++) await shoot(page, beats[i] + 1 / FPS, join(tmp, `${String(i).padStart(5, '0')}.png`));
  const per = 16;
  for (let s = 0; s * per < beats.length; s++) {
    run('ffmpeg', ['-y', '-start_number', String(s * per), '-i', join(tmp, '%05d.png'), '-frames:v', '1', '-vf', `scale=${canvas.width / 4}:-1,tile=8x2:nb_frames=${Math.min(per, beats.length - s * per)}:padding=6:color=0x222222`, join(sheets, `sheet-${s + 1}.png`)]);
    console.log(`sheet-${s + 1}.png  beats ${s * per}-${Math.min(beats.length, (s + 1) * per) - 1}  (${beats[s * per].toFixed(2)}s on)`);
  }
  rmSync(tmp, { recursive: true, force: true });
} else {
  const tmp = join(film, '.frames');
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp);
  const first = await openPage();
  const total = Math.round((await first.evaluate(() => window.DUR)) * FPS);
  const pages = [first, ...(await Promise.all(Array.from({ length: WORKERS - 1 }, openPage)))];
  let next = 0;
  let done = 0;
  const t0 = Date.now();
  await Promise.all(pages.map(async (page) => {
    while (next < total) {
      const f = next++;
      await shoot(page, f / FPS, join(tmp, `${String(f).padStart(5, '0')}.png`));
      if (++done % 150 === 0) console.log(`${done}/${total} frames`);
    }
  }));
  console.log(`${total} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  const audio = join(film, 'audio', 'audio.wav');
  const out = join(film, 'out.mp4');
  await new Promise((ok, bad) => {
    const a = ['-y', '-framerate', String(FPS), '-i', join(tmp, '%05d.png')];
    if (existsSync(audio)) a.push('-i', audio, '-c:a', 'aac', '-b:a', '192k', '-shortest');
    a.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', '-preset', 'slow', '-movflags', '+faststart', out);
    const p = spawn('ffmpeg', a, { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => { err = (err + d).slice(-800); });
    p.on('close', (c) => (c === 0 ? ok() : bad(new Error(err))));
  });
  rmSync(tmp, { recursive: true, force: true });
  console.log(out);
}

await browser.close();
server.close();
