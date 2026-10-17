// Sharp strips of a public web page, for shots where the page fills the frame or the film
// zooms into it. capture.mjs saves the whole page at 2x; this saves one part of it at 4x.
//
//   node capture-strip.mjs <film-dir> <url> <name>=<y0>-<y1> [<name>=<y0>-<y1> ...] [--dpr 4] [--hide "<css>"] [--locale en-US]
//
// y0 and y1 are CSS pixels from the top of the page, the same page that capture.mjs shot
// (its image pixels divided by 2). Each strip is saved as <film-dir>/shots/<name>.jpg,
// 412 x dpr pixels wide. Like capture.mjs it never signs in, never types and never clicks.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const dprAt = args.indexOf('--dpr');
const DPR = dprAt >= 0 ? Number(args.splice(dprAt, 2)[1]) : 4;
// --hide "<css selector>": a fixed header or a banner that would cover part of the strip
const hideAt = args.indexOf('--hide');
const hide = hideAt >= 0 ? args.splice(hideAt, 2)[1] : null;
// --locale en-US: the US version of the page (English reels); the default is en-IN, as in capture.mjs
const localeAt = args.indexOf('--locale');
const locale = localeAt >= 0 ? args.splice(localeAt, 2)[1] : 'en-IN';
const [dir, url, ...parts] = args;
if (!dir || !url || !parts.length) { console.error('usage: node capture-strip.mjs <film-dir> <url> <name>=<y0>-<y1> ...'); process.exit(1); }
const out = join(resolve(dir), 'shots');
mkdirSync(out, { recursive: true });

const VIEW = { width: 412, height: 915 };
const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const context = await browser.newContext({
  viewport: VIEW, deviceScaleFactor: DPR, isMobile: true, hasTouch: true, locale,
  userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
});
const page = await context.newPage();
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
// scroll through once so lazy content loads, then return to the top
await page.evaluate(async () => {
  for (let y = 0; y < Math.min(document.documentElement.scrollHeight, 7000); y += 700) {
    scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 550));
  }
  scrollTo(0, 0);
});
await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
await page.waitForTimeout(900);
if (hide) await page.addStyleTag({ content: `${hide} { display: none !important; }` });
for (const part of parts) {
  const [name, range] = part.split('=');
  const [y0, y1] = range.split('-').map(Number);
  await page.screenshot({ path: join(out, `${name}.jpg`), type: 'jpeg', quality: 92, fullPage: true, clip: { x: 0, y: y0, width: VIEW.width, height: y1 - y0 } });
  console.log(`${name}.jpg  ${VIEW.width * DPR} x ${(y1 - y0) * DPR}  (page ${y0} to ${y1} css px)`);
}
await browser.close();
