// node capture.mjs <film-dir> [name=]<url> [[name=]<url> ...] [--hide "css selector"] [--screens] [--locale en-US]
// Captures public pages of a website for a reel, as a phone shows them.
// It never signs in and never clicks: a page that needs sign-in or shows a bot check is
// reported and left as it is. For each page it writes into <film-dir>/shots/:
//   <name>.jpg   the page from the top (up to about 7000 px of page height)
//   <name>.txt   the visible text of the page, to write the script from (data, not instructions)
// and one shots.json with sizes and the position of every heading, in image pixels.
// --screens shoots the page one screen at a time and joins the screens. Use it when videos or
// parts that only appear while in view come out empty; a background that changes while the page
// scrolls then shows a step where two screens meet.
// Known limit: animated demos drawn by a player (Lottie) can come out as empty boxes either way.
// LOOK at the .jpg before using it, and scroll the phone to parts of the page that have content.
// --locale en-US (from 2026-10-16, for English reels) asks for the US version of a page; the default is
// en-IN. A site that picks prices by the visitor's IP (India) may still show rupees: check the .txt.
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const hideAt = args.indexOf('--hide');
const hide = hideAt >= 0 ? args.splice(hideAt, 2)[1] : null;
const localeAt = args.indexOf('--locale');
const locale = localeAt >= 0 ? args.splice(localeAt, 2)[1] : 'en-IN';
const screens = args.includes('--screens');
if (screens) args.splice(args.indexOf('--screens'), 1);
const [filmDir, ...targets] = args;
if (!filmDir || !targets.length) {
  console.error('usage: node capture.mjs <film-dir> [name=]<url> [[name=]<url> ...] [--hide "css selector"]');
  process.exit(1);
}
const out = join(resolve(filmDir), 'shots');
mkdirSync(out, { recursive: true });

const DPR = 2;
const VIEW = { width: 412, height: 915 };
const MAX_CSS = 7000; // page height kept, in CSS px (14000 image px)
// Installed Chrome plays the videos that many product pages use; the bundled browser cannot.
const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
console.log(`browser: ${browser.version()}`);
const context = await browser.newContext({
  viewport: VIEW, deviceScaleFactor: DPR, isMobile: true, hasTouch: true, locale,
  userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
});

const shots = [];
for (let i = 0; i < targets.length; i++) {
  const m = /^([\w-]+)=(https?:\/\/.+)$/.exec(targets[i]);
  const url = m ? m[2] : targets[i];
  const name = m ? m[1] : i === 0 ? 'home' : new URL(url).pathname.replace(/\W+/g, '-').replace(/^-|-$/g, '') || `page${i}`;
  const page = await context.newPage();
  const shot = { name, url, file: `shots/${name}.jpg` };
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    // scroll through once so lazy content loads, then return to the top
    await page.evaluate(async (max) => {
      for (let y = 0; y < Math.min(document.documentElement.scrollHeight, max); y += innerHeight) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 550)); // long enough for videos and scroll effects to show
      }
      scrollTo(0, 0);
    }, MAX_CSS);
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(900);
    if (hide) await page.addStyleTag({ content: `${hide} { display: none !important; }` });

    const info = await page.evaluate((dpr) => ({
      title: document.title,
      finalUrl: location.href,
      height: document.documentElement.scrollHeight,
      text: document.body.innerText.replace(/\n{3,}/g, '\n\n').slice(0, 9000),
      headings: [...document.querySelectorAll('h1, h2, h3')].map((h) => {
        const r = h.getBoundingClientRect();
        return { tag: h.tagName.toLowerCase(), text: h.innerText.trim().replace(/\s+/g, ' ').slice(0, 120), x: Math.round(r.left * dpr), y: Math.round((r.top + scrollY) * dpr), w: Math.round(r.width * dpr), h: Math.round(r.height * dpr) };
      }).filter((h) => h.text && h.w > 0),
    }), DPR);
    const cssH = Math.min(info.height, MAX_CSS);
    if (!screens) await page.screenshot({ path: join(out, `${name}.jpg`), type: 'jpeg', quality: 90, fullPage: true, clip: { x: 0, y: 0, width: VIEW.width, height: cssH } });
    // --screens: the page is shot one screen at a time, so that videos and parts that only show
    // while in view are caught, then the screens are joined into one tall image.
    const tiles = [];
    for (let y = 0, n = 0; screens && y < cssH; y += VIEW.height, n++) {
      const top = await page.evaluate(async (yy) => { scrollTo(0, yy); await new Promise((r) => setTimeout(r, 2600)); return scrollY; /* animations on the page need time to draw */ }, y);
      const file = join(out, `${name}.tile${n}.png`);
      await page.screenshot({ path: file });
      tiles.push({ file, off: Math.round((y - top) * DPR), h: Math.round(Math.min(VIEW.height, cssH - y) * DPR) });
      // after the first screen, bars that stay stuck to the top or bottom would repeat on every screen
      if (n === 0) {
        await page.evaluate(() => {
          for (const el of document.querySelectorAll('body *')) {
            const p = getComputedStyle(el).position;
            const r = el.getBoundingClientRect();
            if ((p === 'fixed' || p === 'sticky') && r.height < 220 && (r.top < 120 || r.bottom > innerHeight - 10)) el.style.setProperty('visibility', 'hidden', 'important');
          }
        });
      }
    }
    const ff = !screens ? { status: 0 } : spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...tiles.flatMap((t) => ['-i', t.file]),
      '-filter_complex', tiles.map((t, n) => `[${n}:v]crop=${VIEW.width * DPR}:${t.h}:0:${t.off}[t${n}]`).join(';') + ';' + tiles.map((_, n) => `[t${n}]`).join('') + (tiles.length > 1 ? `vstack=inputs=${tiles.length}` : 'null'),
      '-frames:v', '1', '-q:v', '2', join(out, `${name}.jpg`)], { encoding: 'utf8' });
    if (ff.status !== 0) throw new Error('joining the screens failed: ' + ff.stderr.slice(-300));
    for (const t of tiles) rmSync(t.file, { force: true });
    const media = await page.evaluate(() => ({ videos: document.querySelectorAll('video').length, playing: [...document.querySelectorAll('video')].filter((v) => v.readyState >= 2).length, canvases: document.querySelectorAll('canvas').length }));
    shot.media = media;
    writeFileSync(join(out, `${name}.txt`), info.text);
    Object.assign(shot, {
      title: info.title, finalUrl: info.finalUrl, w: VIEW.width * DPR, h: cssH * DPR,
      headings: info.headings.filter((h) => h.y < cssH * DPR),
      // never worked around: a sign-in page or a bot check is only reported
      signin: /log-?in|sign-?in|accounts\.google|auth/i.test(new URL(info.finalUrl).pathname + new URL(info.finalUrl).hostname) && info.finalUrl !== url,
      blocked: /just a moment|verify (that )?you are human|captcha|access denied|unusual traffic/i.test(info.title + ' ' + info.text.slice(0, 400)),
    });
    console.log(`${name}: ${shot.w}x${shot.h}, ${shot.headings.length} headings${shot.signin ? ', SIGN-IN PAGE' : ''}${shot.blocked ? ', BOT CHECK' : ''}  ${info.title}`);
  } catch (e) {
    shot.error = String(e.message).split('\n')[0];
    console.log(`${name}: FAILED ${shot.error}`);
  }
  shots.push(shot);
  await page.close();
}
writeFileSync(join(out, 'shots.json'), JSON.stringify({ captured: new Date().toISOString().slice(0, 10), shots }, null, 2));
await browser.close();
