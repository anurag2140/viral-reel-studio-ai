// Shared by the three look tests (a, b, c): maths, DOM helpers, masked word reveals.
// Every film here is still a pure function of time: window.seek(t) paints frame t.
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, p) => a + (b - a) * p;
export const prog = (t, a, d) => clamp((t - a) / d);
export const expoOut = (p) => (p >= 1 ? 1 : 1 - 2 ** (-10 * p));
export const cubicOut = (p) => 1 - (1 - p) ** 3;
export const eio = (p) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);
export const backOut = (p) => 1 + 2.70158 * (p - 1) ** 3 + 1.70158 * (p - 1) ** 2;
export const bump = (x) => (x <= 0 ? 0 : Math.exp(-7 * x) * Math.sin(18 * x));
export const pulse = (t, at, w = 0.08) => Math.exp(-(((t - at) / w) ** 2));

export function el(tag, css, parent, html) {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (html != null) e.innerHTML = html;
  parent.appendChild(e);
  return e;
}

const preload = (src) => new Promise((ok, bad) => {
  const i = new Image();
  i.onload = ok;
  i.onerror = () => bad(new Error('cannot load ' + src));
  i.src = src;
});
export async function setup(fonts, images = []) {
  await document.fonts.ready;
  await Promise.all(fonts.map((f) => document.fonts.load(f, 'अAI')));
  await Promise.all(images.map(preload));
}

// A line of words that rise out of a mask, one by one. words: [{ word, t }].
// Returns [{ m, w, t }]; call reveal(list, time) every frame.
export function maskLine(parent, words, css = '') {
  const line = el('div', `white-space:nowrap;${css}`, parent);
  return words.map((x, i) => {
    // the padding keeps the marks above and below Devanagari letters inside the mask
    const m = el('span', 'display:inline-block;overflow:hidden;vertical-align:top;padding:.3em .05em .14em;margin:-.3em -.05em -.14em', line);
    const w = el('span', 'display:inline-block;white-space:pre;will-change:transform', m, x.word + (i < words.length - 1 ? ' ' : ''));
    return { m, w, t: x.t, line };
  });
}
export function reveal(list, time, d = 0.34) {
  for (const x of list) {
    const p = expoOut(prog(time, x.t - 0.03, d));
    x.w.style.visibility = p <= 0 ? 'hidden' : 'visible';
    x.w.style.transform = `translateY(${(1 - p) * 115}%) rotate(${(1 - p) * 5}deg)`;
  }
}

// On-screen words drop the sentence mark: "AI।" reads like "AII" in a Latin face.
export const clean = (words) => words.map((x) => ({ ...x, word: x.word.replace(/[।.,]+$/, '') }));

// A line of words that pop in place with overshoot, one by one. Call pop(list, time) every frame.
export function popLine(parent, words, css = '') {
  const line = el('div', `white-space:nowrap;${css}`, parent);
  return words.map((x, i) => ({
    w: el('span', 'display:inline-block;white-space:pre;will-change:transform', line, x.word + (i < words.length - 1 ? ' ' : '')),
    t: x.t, r: i % 2 ? 5 : -5, line,
  }));
}
export function pop(list, time, d = 0.3) {
  for (const x of list) {
    const p = prog(time, x.t - 0.03, d);
    x.w.style.visibility = p <= 0 ? 'hidden' : 'visible';
    x.w.style.transform = `scale(${backOut(p)}) rotate(${(1 - cubicOut(p)) * x.r}deg)`;
  }
}

// Sets a line's font size so that the line is `w` wide (poster lock-up: every line the same width).
export function fillWidth(line, w, max = 420) {
  line.style.display = 'inline-block';
  line.style.fontSize = '100px';
  const fs = Math.min(max, Math.floor((100 * w) / line.offsetWidth));
  line.style.fontSize = fs + 'px';
  line.style.display = 'block';
  return fs;
}

// Shrinks a block's font until it is no wider than maxW.
export function fitWidth(block, maxW, startPx, minPx = 60) {
  let fs = startPx;
  block.style.fontSize = fs + 'px';
  while (block.scrollWidth > maxW && fs > minPx) { fs -= 4; block.style.fontSize = fs + 'px'; }
  return fs;
}

// A mouse pointer. Its tip is the element's top-left corner.
export const pointer = (parent, fill, stroke, size = 130) =>
  el('div', 'position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform', parent,
    `<svg width="${size}" height="${size * 1.36}" viewBox="-8 -8 110 150" style="display:block;margin:-${size * 0.073}px 0 0 -${size * 0.073}px"><path d="M0 0 L0 110 L30 82 L52 132 L74 122 L52 74 L92 74Z" fill="${fill}" stroke="${stroke}" stroke-width="9" stroke-linejoin="round"/></svg>`);

// A cut-out of the captured web page: a box that shows the page from `scroll` (image pixels).
// Returns { box, k, set(scroll) }; k turns image pixels into box pixels.
export function pageCrop(parent, src, css, width, imgW = 824) {
  const k = width / imgW;
  const box = el('div', `background:url(${src}) 0 0/${width}px auto no-repeat;${css}`, parent);
  return { box, k, set: (scroll) => { box.style.backgroundPosition = `0 ${-scroll * k}px`; } };
}

export function start(stage, U, dur) {
  window.DUR = dur;
  window.seek = (t) => { for (const u of U) u(t); };
  window.seek(0);
  window.ready = true;
  if (new URLSearchParams(location.search).has('render')) return;
  // preview only: fit the stage to the window and follow the audio clock
  const fit = () => { stage.style.transform = `scale(${Math.min(innerWidth / 1080, innerHeight / 1920)})`; };
  fit();
  addEventListener('resize', fit);
  const au = el('audio', 'position:fixed;left:8px;bottom:8px;width:300px', document.body);
  au.src = 'audio/audio.wav';
  au.controls = true;
  const loop = () => { window.seek(au.currentTime); requestAnimationFrame(loop); };
  loop();
}
