// Takes a picture of a page of this project (a character sheet, a look option).
//   node sheet.mjs <page.html> <out.png> [--clip x,y,w,h]
// The page is served over http from the project folder, so its modules and images load, and
// the picture is taken when the page sets window.ready (or after the network is quiet).
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const args = process.argv.slice(2);
const clipAt = args.indexOf('--clip');
const clip = clipAt >= 0 ? args.splice(clipAt, 2)[1].split(',').map(Number) : null;
// --export <dir>: also write the files that the page offers in window.exports ({ name: text })
const exAt = args.indexOf('--export');
const exDir = exAt >= 0 ? args.splice(exAt, 2)[1] : null;
const [html, png] = args;
if (!html || !png) { console.error('usage: node sheet.mjs <page.html> <out.png> [--clip x,y,w,h]'); process.exit(1); }
const root = process.cwd();
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.css': 'text/css' };
const server = createServer(async (req, res) => {
  try {
    const file = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!resolve(file).startsWith(resolve(root))) throw new Error('outside the project');
    res.writeHead(200, { 'content-type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('not found'); }
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on('pageerror', (e) => console.error('page error: ' + e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/${html.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
await page.waitForFunction('window.ready === true', null, { timeout: 15000 }).catch(() => {});
await page.screenshot(clip ? { path: png, clip: { x: clip[0], y: clip[1], width: clip[2], height: clip[3] } } : { path: png, fullPage: true });
if (exDir) {
  const { mkdirSync, writeFileSync } = await import('node:fs');
  mkdirSync(exDir, { recursive: true });
  const files = (await page.evaluate(() => window.exports ?? {}));
  for (const name in files) { writeFileSync(join(exDir, name), files[name]); console.log(join(exDir, name)); }
}
await browser.close();
server.close();
console.log(png);
