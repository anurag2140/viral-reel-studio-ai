// node brand/shot.mjs <html> <png>
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';

const [html, png] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1720, height: 900 }, deviceScaleFactor: 1.5 });
await page.goto(pathToFileURL(html).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: png, fullPage: true });
await browser.close();
