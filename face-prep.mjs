// Prepares my face images for the story kit: every expression on the same canvas, the head at
// the same size and place, so that one can replace another without a jump.
//
//   node face-prep.mjs "<folder with the source PNGs>"
//
// Source: PNGs with a transparent background, head only (cut at the chin), named after the
// expression. Output: brand/face/<name>.png and brand/face/face.json (sizes, anchor points,
// skin and hair colour taken from the neutral face). The source files are not changed.
// Names say where the eyes look on screen, the same as my file names ("Looking left" looks to
// the left of the frame). The first version swapped them; fixed on 2026-10-15.
import { chromium } from 'playwright';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const src = resolve(process.argv[2] ?? 'facial expresson headshot');
const out = resolve('brand/face');
mkdirSync(out, { recursive: true });

// first match wins, so "neutral with mouth open (talking)" is `talk`, not `neutral`
const NAMES = [[/talk|mouth open/i, 'talk'], [/blink|closed/i, 'blink'], [/looking left/i, 'look-left'], [/looking right/i, 'look-right'],
  [/grin/i, 'grin'], [/worried|panic/i, 'worried'], [/yawn|tired/i, 'yawn'], [/wink|smug/i, 'wink'], [/think/i, 'thinking'],
  [/disappoint|sad/i, 'sad'], [/amaz|shock|surpris/i, 'amazed'], [/neutral/i, 'neutral']];
const files = readdirSync(src).filter((f) => /\.png$/i.test(f));
const items = files.map((f) => ({ file: f, name: (NAMES.find(([re]) => re.test(f)) ?? [])[1], url: 'data:image/png;base64,' + readFileSync(join(src, f)).toString('base64') }));
const unknown = items.filter((x) => !x.name);
if (unknown.length) console.log('no expression name found for: ' + unknown.map((x) => x.file).join(', '));

const W = 840, H = 1140, TOP = 24, OUT = 0.75; // canvas at the reference scale, then saved at 75%
const browser = await chromium.launch();
const page = await browser.newPage();
const res = await page.evaluate(async ({ items, W, H, TOP, OUT }) => {
  const read = async (it) => {
    const img = new Image();
    img.src = it.url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
    for (let yy = 0; yy < c.height; yy++) for (let xx = 0; xx < c.width; xx++) {
      if (d[(yy * c.width + xx) * 4 + 3] > 24) { x0 = Math.min(x0, xx); x1 = Math.max(x1, xx); y0 = Math.min(y0, yy); y1 = Math.max(y1, yy); }
    }
    return { ...it, img, d, iw: c.width, box: [x0, y0, x1 - x0 + 1, y1 - y0 + 1] };
  };
  const all = [];
  for (const it of items) if (it.name) all.push(await read(it));
  // the reference width of the head is the middle one of the faces that look straight ahead
  const front = all.filter((a) => !a.name.startsWith('look-'));
  const widths = front.map((a) => a.box[2]).sort((a, b) => a - b);
  const ref = widths[Math.floor(widths.length / 2)];
  const done = [];
  for (const a of all) {
    // a turned head is wider than its true size shows, so it keeps the reference scale
    const k = a.name.startsWith('look-') ? 1 : ref / a.box[2];
    const c = document.createElement('canvas');
    c.width = Math.round(W * OUT); c.height = Math.round(H * OUT);
    const x = c.getContext('2d');
    x.imageSmoothingQuality = 'high';
    const s = k * OUT;
    x.drawImage(a.img, (W / 2) * OUT - (a.box[0] + a.box[2] / 2) * s, TOP * OUT - a.box[1] * s, a.img.width * s, a.img.height * s);
    done.push({ name: a.name, file: a.file, scale: +k.toFixed(4), chin: Math.round((TOP + a.box[3] * k) * OUT), width: Math.round(a.box[2] * k * OUT), png: c.toDataURL('image/png').split(',')[1] });
  }
  // colours from the neutral face: the mean of a patch, as a hex string
  const n = all.find((a) => a.name === 'neutral') ?? all[0];
  const patch = (fx, fy, r = 14) => {
    const cx = Math.round(n.box[0] + n.box[2] * fx), cy = Math.round(n.box[1] + n.box[3] * fy);
    let R = 0, G = 0, B = 0, m = 0;
    for (let yy = cy - r; yy <= cy + r; yy++) for (let xx = cx - r; xx <= cx + r; xx++) {
      const i = (yy * n.iw + xx) * 4;
      if (n.d[i + 3] > 200) { R += n.d[i]; G += n.d[i + 1]; B += n.d[i + 2]; m++; }
    }
    return '#' + [R, G, B].map((v) => Math.round(v / m).toString(16).padStart(2, '0')).join('');
  };
  return { done, ref, skin: patch(0.5, 0.36), cheek: patch(0.27, 0.6), shade: patch(0.5, 0.955, 8), hair: patch(0.5, 0.1) };
}, { items, W, H, TOP, OUT });
await browser.close();

for (const f of res.done) {
  writeFileSync(join(out, f.name + '.png'), Buffer.from(f.png, 'base64'));
  console.log(`${(f.name + '.png').padEnd(16)} from "${f.file}"  scale ${f.scale}  chin at ${f.chin}  head width ${f.width}`);
}
const meta = {
  note: 'Made by face-prep.mjs. Names say where the eyes look on screen.',
  size: [Math.round(W * OUT), Math.round(H * OUT)], top: Math.round(TOP * OUT), centre: Math.round((W / 2) * OUT),
  faceWidth: Math.round(res.ref * OUT), chin: Object.fromEntries(res.done.map((f) => [f.name, f.chin])),
  names: res.done.map((f) => f.name), skin: res.skin, cheek: res.cheek, shade: res.shade, hair: res.hair,
};
writeFileSync(join(out, 'face.json'), JSON.stringify(meta, null, 2));
console.log(`face.json: skin ${meta.skin}, cheek ${meta.cheek}, under the chin ${meta.shade}, hair ${meta.hair}`);
