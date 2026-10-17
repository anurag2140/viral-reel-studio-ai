// Kagaz drawing kit: hand-drawn strokes, cards, pops and spoken captions.
// Everything registers an updater that is a pure function of time; kit.frame(t) runs them.
import { wordTimes } from './timing.js';

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, p) => a + (b - a) * p;
export const prog = (t, a, d) => clamp((t - a) / d);
export const eo = (p) => 1 - (1 - p) ** 3;
export const ei = (p) => p * p * p;
export const eio = (p) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);
export const sp = (x) => (x <= 0 ? 0 : 1 - Math.exp(-9 * x) * Math.cos(16 * x)); // settle with overshoot
export const bump = (x) => (x <= 0 ? 0 : Math.exp(-7 * x) * Math.sin(18 * x));
export function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NS = 'http://www.w3.org/2000/svg';
export const $ = (n, a = {}, p) => {
  const e = document.createElementNS(NS, n);
  for (const k in a) e.setAttribute(k, a[k]);
  if (p) p.appendChild(e);
  return e;
};
export const circ = (cx, cy, r, n = 26, a0 = -2.2) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + (i / n) * Math.PI * 2.06;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
export const box = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y - 4]];

function subdiv(pts, step) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let k = 1; k <= n; k++) out.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
  }
  return out;
}
function jit(pts, sd, amp) {
  const r = mulberry32(sd);
  return pts.map(([x, y]) => [x + (r() - 0.5) * 2 * amp, y + (r() - 0.5) * 2 * amp]);
}
function toPath(p) {
  const f = (q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
  let d = 'M' + f(p[0]);
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    d += `C${f([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6])} ${f([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6])} ${f(p2)}`;
  }
  return d;
}

// Fetch brand tokens, set them as CSS variables on the stage, wait for the fonts.
export async function boot(stage) {
  const brand = await (await fetch('/brand/brand.json')).json();
  for (const [k, v] of Object.entries(brand.color)) stage.style.setProperty(`--${k}`, v);
  const css = document.createElement('style');
  css.textContent = `
    .cap { position: absolute; left: 60px; top: var(--cap-top, 342px); width: 960px; font: 800 88px/1.16 "Baloo 2"; color: var(--ink); }
    .cap .w { display: inline-block; white-space: pre; }
    .cap .hl { background: linear-gradient(var(--accent), var(--accent)) no-repeat 0 60% / 0% 84%; }`;
  document.head.appendChild(css);
  await document.fonts.ready;
  await Promise.all(['800 80px "Baloo 2"', '700 80px "Baloo 2"', '600 40px Mukta', '700 40px Mukta'].map((f) => document.fonts.load(f, 'अAI')));
  return brand;
}

// Loads an image before the film is built, so its size is known: { src, w, h }.
export const loadImage = (src) => new Promise((ok, bad) => {
  const i = new Image();
  i.onload = () => ok({ src, w: i.naturalWidth, h: i.naturalHeight });
  i.onerror = () => bad(new Error('cannot load ' + src));
  i.src = src;
});

// The fixed header row of every film: the category tag (TOOL, SCAM, AI), then the short title.
// Its height on the page is brand.canvas.headerTop; do not move it per film.
// With a number, a red "EP 03" pill sits between them (episodes #04 and #05); reels pass null.
export function header(stage, brand, topic, number, title) {
  const top = brand.canvas.headerTop;
  const tag = document.createElement('div');
  tag.textContent = topic;
  tag.style.cssText = `position:absolute;left:60px;top:${top}px;font:700 34px/1 Mukta;letter-spacing:.16em;border:3.5px solid var(--ink);border-radius:99px;padding:13px 22px 11px;color:var(--ink)`;
  const row = document.createElement('div');
  row.style.cssText = `position:absolute;top:${top}px;height:66px;display:flex;align-items:center;gap:16px;white-space:nowrap`;
  row.innerHTML = '<b style="font:800 40px/1 \'Baloo 2\';color:var(--paper);background:var(--accent);border:3.5px solid var(--ink);border-radius:99px;padding:14px 20px 8px"></b><span style="font:700 42px/1 Mukta;color:var(--ink)"></span>';
  if (number == null) row.firstChild.remove();
  else row.firstChild.textContent = 'EP ' + String(number).padStart(2, '0');
  const name = row.lastChild;
  name.textContent = title;
  stage.append(tag, row);
  row.style.left = tag.offsetLeft + tag.offsetWidth + 22 + 'px';
  // a long title shrinks until the row fits the width
  for (let fs = 42; row.offsetLeft + row.offsetWidth > 1030 && fs > 30; fs -= 2) name.style.fontSize = fs + 'px';
}

export function createKit(brand) {
  const { paper: PAPER, card: CARD, ink: INK, accent: RED } = brand.color;
  // Sticker Pop colours. Roles: blue = mascot, pink = caption highlight and main button,
  // yellow = rays behind the hero, mint and orange = supporting stickers, red = marker.
  const { blue: BLUE = RED, blueLight: BLUE_LIGHT = CARD, pink: PINK = RED, yellow: YELLOW = CARD, mint: MINT = CARD, orange: ORANGE = RED } = brand.pop ?? {};
  // highlight colour and its text colour, one pair per caption in turn
  const HLS = brand.pop ? [[PINK, PAPER], [BLUE, PAPER], [YELLOW, INK]] : [[RED, PAPER]];
  const U = [];
  const st = { boil: 0, seed: 7, out: null }; // st.out: default erase time for what is built next

  // A pencil or marker stroke that draws on, boils, and erases.
  function stroke(parent, pts, o = {}) {
    const { t = 0, d = 0.4, w = 16, color = INK, fill = 'none', amp = 5, step = 70, smooth = false, out = st.out, outD = 0.3, op = 1, cap = 'round' } = o;
    const base = smooth ? pts : subdiv(pts, step);
    const vars = [0, 1, 2].map((k) => toPath(jit(base, st.seed + k * 977, amp)));
    st.seed += 13;
    const e = $('path', { fill, stroke: color, 'stroke-width': w, 'stroke-linecap': cap, 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '1 1', opacity: op }, parent);
    U.push((time) => {
      let p = eo(prog(time, t, d));
      if (out != null) p *= 1 - prog(time, out, outD);
      if (p <= 0.002) { e.style.display = 'none'; return; }
      e.style.display = '';
      e.setAttribute('d', vars[st.boil]);
      e.setAttribute('stroke-dashoffset', 1 - p);
    });
    return e;
  }
  // A group that pops in with a spring and shrinks out.
  function pop(parent, x, y, o = {}) {
    const { t = 0, rot = 0, out = st.out, s = 1, spin = 0 } = o;
    const g = $('g', {}, parent);
    U.push((time) => {
      let k = sp(time - t) * s;
      if (out != null) k *= 1 - ei(prog(time, out, 0.22));
      if (k <= 0.002) { g.style.display = 'none'; return; }
      g.style.display = '';
      g.setAttribute('transform', `translate(${x} ${y}) rotate(${rot + spin * time}) scale(${k})`);
    });
    return g;
  }
  function txt(parent, x, y, str, o = {}) {
    const { size = 80, weight = 800, font = 'Baloo 2', color = INK, anchor = 'middle' } = o;
    const g = pop(parent, x, y, o);
    $('text', { 'font-family': `"${font}"`, 'font-size': size, 'font-weight': weight, fill: color, 'text-anchor': anchor }, g).textContent = str;
    return g;
  }
  function dot(parent, x, y, r, o = {}) {
    const g = pop(parent, x, y, o);
    $('circle', { r, fill: o.fill ?? INK, stroke: o.stroke ?? 'none', 'stroke-width': o.sw ?? 10 }, g);
    return g;
  }
  // A cream card with ink outline and hard shadow. With t set it drops, tilts and settles.
  function card(parent, cx, cy, w, h, rot, t = null, o = {}) {
    const { out = st.out, fill = CARD, rx = 30, sw = 10, shadow = [22, 26] } = o;
    const g = $('g', {}, parent);
    $('rect', { x: -w / 2 + shadow[0], y: -h / 2 + shadow[1], width: w, height: h, rx, fill: INK }, g);
    $('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx, fill, stroke: INK, 'stroke-width': sw }, g);
    if (t == null) { g.setAttribute('transform', `translate(${cx} ${cy}) rotate(${rot})`); return g; }
    U.push((time) => {
      const x = time - t;
      let k = x < 0 ? 0 : 1;
      if (out != null) k *= 1 - ei(prog(time, out, 0.22));
      if (k <= 0.002) { g.style.display = 'none'; return; }
      g.style.display = '';
      const e = eo(clamp(x / 0.28));
      const b = bump(x - 0.28); // squash and stretch on landing
      const sc = lerp(1.35, 1, e) * k;
      g.setAttribute('transform', `translate(${cx} ${cy - (1 - e) * 170}) rotate(${rot + (1 - e) * 12 + 3 * b}) scale(${sc * (1 + 0.09 * b)} ${sc * (1 - 0.11 * b)})`);
    });
    return g;
  }

  // The spoken sentence, word by word, with marker highlight on the key words.
  // list: [{ a, text, hl, words? }] where a sentence span { a, b, text } also works.
  function captions(container, list, dur) {
    const caps = list.map((c) => ({ ...c, words: c.words ?? wordTimes(c) }));
    caps.forEach((c, n) => {
      c.end = caps[n + 1]?.a ?? dur + 1;
      const el = document.createElement('div');
      el.className = 'cap';
      const hlWords = (c.hl ?? '').split(' ');
      const clean = (w) => w.replace(/[।,?.!:]/g, '');
      const start = c.hl ? c.words.findIndex((_, k) => hlWords.every((h, m) => c.words[k + m] && clean(c.words[k + m].word) === h)) : -1;
      c.spans = c.words.map((w, k) => {
        const sEl = document.createElement('span');
        const inHl = start >= 0 && k >= start && k < start + hlWords.length;
        const lastHl = k === start + hlWords.length - 1;
        sEl.className = inHl ? 'w hl' : 'w';
        if (inHl) sEl.style.backgroundImage = `linear-gradient(${HLS[n % HLS.length][0]}, ${HLS[n % HLS.length][0]})`;
        sEl.textContent = w.word + (k < c.words.length - 1 && !(inHl && lastHl) ? ' ' : '');
        el.appendChild(sEl);
        if (inHl && lastHl && k < c.words.length - 1) el.appendChild(document.createTextNode(' '));
        return { el: sEl, t: w.t, inHl };
      });
      container.appendChild(el);
      let fs = 112;
      if (c.big) {
        // the hook: as large as fits in `big` px of height (true = 440), so it reads in under a second
        const maxH = c.big === true ? 440 : c.big;
        el.style.whiteSpace = 'normal';
        el.style.lineHeight = '1.1';
        fs = 196;
        do { fs -= 6; el.style.fontSize = fs + 'px'; } while ((el.offsetHeight > maxH || el.scrollWidth > 962) && fs > 96);
      } else {
        // one line as large as it fits, else two lines
        el.style.whiteSpace = 'nowrap';
        do { fs -= 4; el.style.fontSize = fs + 'px'; } while (el.scrollWidth > 960 && fs > 84);
        if (el.scrollWidth > 960) {
          el.style.whiteSpace = 'normal';
          fs = 92;
          do { fs -= 4; el.style.fontSize = fs + 'px'; } while (el.offsetHeight > fs * 1.16 * 2 + 6 && fs > 56);
        }
      }
      c.el = el;
      c.hlText = HLS[n % HLS.length][1];
    });
    U.push((t) => {
      for (const c of caps) {
        const on = t >= c.a && t < c.end;
        c.el.style.display = on ? '' : 'none';
        if (!on) continue;
        for (const s of c.spans) {
          const x = t - s.t;
          const e = eo(clamp(x / 0.16));
          s.el.style.visibility = x < 0 ? 'hidden' : 'visible';
          s.el.style.transform = `translateY(${(1 - e) * 30}px) rotate(${(1 - e) * -4}deg)`;
          if (!s.inHl) continue;
          const hp = eo(prog(t, s.t + 0.03, 0.18));
          s.el.style.backgroundSize = `${hp * 100}% 84%`;
          s.el.style.color = hp > 0.45 ? c.hlText : INK;
        }
      }
    });
  }

  // ---------- Sticker Pop ----------
  // Rays that turn slowly behind the hero of a scene. Kept below `top` so captions stay clean.
  function sunburst(parent, cx, cy, o = {}) {
    const { t = -1, out = null, color = YELLOW, r = 1700, n = 14, spin = 7, top = 540 } = o;
    let d = '';
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = a0 + Math.PI / n;
      d += `M0 0 L${(Math.cos(a0) * r).toFixed(0)} ${(Math.sin(a0) * r).toFixed(0)} L${(Math.cos(a1) * r).toFixed(0)} ${(Math.sin(a1) * r).toFixed(0)}Z `;
    }
    const id = `rays${st.seed++}`;
    $('rect', { x: -400, y: top, width: 1880, height: 2400 }, $('clipPath', { id }, parent));
    const g = $('g', {}, $('g', { 'clip-path': `url(#${id})` }, parent));
    $('path', { d, fill: color }, g);
    U.push((time) => {
      let k = eo(prog(time, t, 0.4));
      if (out != null) k *= 1 - ei(prog(time, out, 0.25));
      g.style.display = k <= 0.002 ? 'none' : '';
      g.setAttribute('transform', `translate(${cx} ${cy}) rotate(${spin * time}) scale(${k})`);
    });
    return g;
  }
  // A small sticker shape that pops in and keeps wobbling: circle, plus, squiggle or star.
  function sticker(parent, kind, x, y, size, color, o = {}) {
    const { t = -1, out = null, rot = 0 } = o;
    const g = $('g', {}, parent);
    if (kind === 'circle') $('circle', { r: size, fill: color, stroke: INK, 'stroke-width': 10 }, g);
    if (kind === 'plus') $('path', { d: `M0 ${-size} V${size} M${-size} 0 H${size}`, stroke: color, 'stroke-width': size * 0.55, 'stroke-linecap': 'round' }, g);
    if (kind === 'squiggle') $('path', { d: `M${-size} 0 q${size / 4} ${-size * 0.7} ${size / 2} 0 t${size / 2} 0 t${size / 2} 0 t${size / 2} 0`, fill: 'none', stroke: color, 'stroke-width': size * 0.22, 'stroke-linecap': 'round' }, g);
    if (kind === 'star') {
      const d = Array.from({ length: 28 }, (_, i) => {
        const a = (i / 28) * Math.PI * 2;
        const r = size * (i % 2 ? 0.78 : 1);
        return `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
      }).join(' ') + 'Z';
      $('path', { d, fill: INK, transform: 'translate(12 14)' }, g);
      $('path', { d, fill: color, stroke: INK, 'stroke-width': 10, 'stroke-linejoin': 'round' }, g);
    }
    const ph = st.seed++ * 1.7;
    U.push((time) => {
      let k = sp(time - t);
      if (out != null) k *= 1 - ei(prog(time, out, 0.22));
      g.style.display = k <= 0.002 ? 'none' : '';
      g.setAttribute('transform', `translate(${x} ${y + Math.sin(time * 2.2 + ph) * 6}) rotate(${rot + Math.sin(time * 1.7 + ph) * 7}) scale(${k})`);
    });
    return g;
  }
  // The channel mascot: a three-eyed monster. Its origin is the ground between its feet; at
  // scale 1 it is about 620 wide (880 with arms) and 1060 tall.
  // o.pose(time) may return { look: [x, y] (where the eyes look, in the parent's coordinates),
  // mouth: 0..1 (how open), wave: 0..1 (arms), hop: px (jump height), squash: -0.2..0.2 }.
  function mascot(parent, x, y, s, o = {}) {
    const { t = -1, out = null, pose = () => ({}), flip = false, color = BLUE, spot = BLUE_LIGHT, belly = false } = o;
    const BODY = 'M-290 -70 C-370 -410 -290 -800 0 -800 C290 -800 370 -410 290 -70 C275 0 -275 0 -290 -70Z';
    const MOUTH = 'M-210 -550 C-210 -690 210 -690 210 -550 C210 -380 -210 -380 -210 -550Z';
    const g = $('g', {}, parent);
    const id = `mouth${st.seed++}`;
    $('path', { d: MOUTH }, $('clipPath', { id }, g));
    const limb = (p, d, a = 58, b = 34) => {
      $('path', { d, fill: 'none', stroke: INK, 'stroke-width': a, 'stroke-linecap': 'round' }, p);
      $('path', { d, fill: 'none', stroke: color, 'stroke-width': b, 'stroke-linecap': 'round' }, p);
    };
    $('path', { d: BODY, fill: INK, transform: 'translate(26 30)' }, g);
    const armL = $('g', {}, g);
    limb(armL, 'M-278 -340 C-390 -360 -440 -460 -390 -540');
    $('circle', { cx: -390, cy: -540, r: 38, fill: color, stroke: INK, 'stroke-width': 12 }, armL);
    const armR = $('g', {}, g);
    limb(armR, 'M278 -340 C400 -350 460 -440 425 -515');
    $('circle', { cx: 425, cy: -515, r: 38, fill: color, stroke: INK, 'stroke-width': 12 }, armR);
    limb(g, 'M-110 -760 C-140 -830 -160 -870 -175 -900', 44, 20);
    limb(g, 'M0 -790 C0 -850 0 -890 0 -930', 44, 20);
    limb(g, 'M110 -760 C140 -820 160 -860 172 -890', 44, 20);
    $('path', { d: BODY, fill: color, stroke: INK, 'stroke-width': 12 }, g);
    [[-210, -260, 34], [220, -200, 26], [205, -340, 16], [-240, -410, 18]].forEach(([cx, cy, r]) => $('circle', { cx, cy, r, fill: spot }, g));
    [-140, 140].forEach((cx) => $('ellipse', { cx, cy: -25, rx: 86, ry: 36, fill: color, stroke: INK, 'stroke-width': 12 }, g));
    const mouth = $('g', {}, g);
    const inside = $('g', { 'clip-path': `url(#${id})` }, mouth);
    $('path', { d: MOUTH, fill: INK }, inside);
    $('ellipse', { cx: -50, cy: -450, rx: 125, ry: 72, fill: PINK }, inside);
    for (let i = 0; i < 6; i++) $('path', { d: `M${-195 + i * 68} -710 L${-161 + i * 68} ${-586 + (i % 2) * 14} L${-127 + i * 68} -710Z`, fill: '#fff', stroke: INK, 'stroke-width': 7, 'stroke-linejoin': 'round' }, inside);
    $('path', { d: 'M-110 -350 L-78 -462 L-46 -350Z M46 -350 L78 -454 L110 -350Z', fill: '#fff', stroke: INK, 'stroke-width': 7, 'stroke-linejoin': 'round' }, inside);
    $('path', { d: MOUTH, fill: 'none', stroke: INK, 'stroke-width': 12 }, mouth);
    let window = null;
    if (belly) {
      $('rect', { x: -122, y: -302, width: 244, height: 196, rx: 30, fill: CARD, stroke: INK, 'stroke-width': 12 }, g);
      window = $('g', { transform: 'translate(0 -204)' }, g);
    }
    const eyes = [[-175, -930, 66], [0, -980, 84], [175, -922, 66]].map(([cx, cy, r]) => {
      const eg = $('g', {}, g);
      $('circle', { r, fill: '#fff', stroke: INK, 'stroke-width': 12 }, eg);
      const pupil = $('g', {}, eg);
      $('circle', { r: r * 0.44, fill: INK }, pupil);
      $('circle', { cx: r * 0.14, cy: -r * 0.16, r: r * 0.13, fill: '#fff' }, pupil);
      return { cx, cy, r, eg, pupil };
    });
    const ph = st.seed++ * 0.9;
    U.push((time) => {
      let k = sp(time - t);
      if (out != null) k *= 1 - ei(prog(time, out, 0.22));
      if (k <= 0.002) { g.style.display = 'none'; return; }
      g.style.display = '';
      const p = pose(time) ?? {};
      const hop = p.hop ?? 0;
      const breathe = 1 + 0.025 * Math.sin(time * 3.3 + ph) + (p.squash ?? 0);
      g.setAttribute('transform', `translate(${x} ${y - hop}) scale(${((flip ? -1 : 1) * s * k) / breathe} ${s * k * breathe})`);
      mouth.setAttribute('transform', `translate(0 -550) scale(1 ${lerp(0.25, 1, p.mouth ?? 0.5)}) translate(0 550)`);
      const w = p.wave ?? 0;
      armL.setAttribute('transform', `rotate(${w * (14 + 16 * Math.sin(time * 11 + ph))} -278 -340)`);
      armR.setAttribute('transform', `rotate(${-w * (14 + 16 * Math.sin(time * 11 + ph + 1))} 278 -340)`);
      const look = p.look ?? [x, y - 3000];
      const lx = ((look[0] - x) / s) * (flip ? -1 : 1);
      const ly = (look[1] - (y - hop)) / s;
      const blink = (time + ph) % 2.7 < 0.1 ? 0.12 : 1;
      for (const e of eyes) {
        const m = Math.hypot(lx - e.cx, ly - e.cy) || 1;
        e.pupil.setAttribute('transform', `translate(${((lx - e.cx) / m) * e.r * 0.36} ${((ly - e.cy) / m) * e.r * 0.36})`);
        e.eg.setAttribute('transform', `translate(${e.cx} ${e.cy}) scale(1 ${blink})`);
      }
    });
    return { g, belly: window };
  }

  // ---------- reels: a recorded web page, and the follow tag ----------
  const pending = []; // images that must load before the first frame is shot
  const settled = () => Promise.all(pending);
  const label = (parent, x, y, str, a = {}) => {
    const e = $('text', { x, y, 'font-family': '"Baloo 2"', 'font-weight': 800, 'font-size': 80, fill: INK, 'text-anchor': 'middle', ...a }, parent);
    e.textContent = str;
    return e;
  };

  // A phone that shows a captured web page (capture.mjs). The page scrolls as a function of time.
  // shot: { src, w, h } in image pixels. o.keys: [[time, scrollY in image px], ...]; the page eases
  // from one key to the next, so repeat a value to hold. o.pose(time) may return { x, y, s, rot }.
  // Returns { g, page, mark, k }: `page` is a group in image pixels that scrolls with the page,
  // and mark([x, y, w, h], t) draws a marker box around a part of the page.
  function screen(parent, shot, o = {}) {
    const { x = 540, y = 1050, w = 600, h = 980, t = -1, rot = -2, keys = [[0, 0]], out = st.out, bar = '', pose = null } = o;
    const k = w / shot.w;
    const B = 18; // bezel
    const R = 56;
    const barH = bar ? 70 : 0;
    const g = $('g', {}, parent);
    $('rect', { x: -w / 2 - B + 20, y: -h / 2 - B + 24, width: w + 2 * B, height: h + 2 * B, rx: R, fill: INK }, g);
    $('rect', { x: -w / 2 - B, y: -h / 2 - B, width: w + 2 * B, height: h + 2 * B, rx: R, fill: INK }, g);
    const id = `scr${st.seed++}`;
    $('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: R - B }, $('clipPath', { id }, g));
    const view = $('g', { 'clip-path': `url(#${id})` }, g);
    $('rect', { x: -w / 2, y: -h / 2, width: w, height: h, fill: CARD }, view);
    const page = $('g', {}, view);
    const img = $('image', { href: shot.src, width: shot.w, height: shot.h, preserveAspectRatio: 'none' }, page);
    pending.push(new Promise((res) => { img.addEventListener('load', res, { once: true }); img.addEventListener('error', res, { once: true }); }));
    if (bar) {
      // the address bar, so that it reads as a real website
      $('rect', { x: -w / 2, y: -h / 2, width: w, height: barH, fill: PAPER }, view);
      $('path', { d: `M${-w / 2} ${-h / 2 + barH} H${w / 2}`, stroke: INK, 'stroke-width': 5 }, view);
      $('rect', { x: -w / 2 + 28, y: -h / 2 + 13, width: w - 56, height: 44, rx: 22, fill: CARD, stroke: INK, 'stroke-width': 4 }, view);
      label(view, 0, -h / 2 + 46, bar, { 'font-family': 'Mukta', 'font-weight': 600, 'font-size': 30 });
    }
    const maxScroll = Math.max(0, shot.h - (h - barH) / k);
    const scrollAt = (time) => {
      let s = keys[0][1];
      for (let i = 1; i < keys.length; i++) s = lerp(s, keys[i][1], eio(prog(time, keys[i - 1][0], keys[i][0] - keys[i - 1][0])));
      return clamp(s, 0, maxScroll);
    };
    U.push((time) => {
      const q = time - t;
      let v = q < 0 ? 0 : 1;
      if (out != null) v *= 1 - ei(prog(time, out, 0.22));
      if (v <= 0.002) { g.style.display = 'none'; return; }
      g.style.display = '';
      const e = eo(clamp(q / 0.3));
      const b = bump(q - 0.3);
      const p = { x, y, s: 1, rot, ...(pose ? pose(time) : null) };
      g.setAttribute('transform', `translate(${p.x} ${p.y + (1 - e) * 900}) rotate(${p.rot + (1 - e) * 8 + 2 * b}) scale(${v * p.s * (1 + 0.04 * b)} ${v * p.s * (1 - 0.05 * b)})`);
      page.setAttribute('transform', `translate(${-w / 2} ${-h / 2 + barH - scrollAt(time) * k}) scale(${k})`);
    });
    const mark = ([bx, by, bw, bh], tm, m = {}) => stroke(page, box(bx - 14, by - 14, bw + 28, bh + 28), { t: tm, d: 0.3, w: (m.w ?? 12) / k, color: m.color ?? RED, amp: 4 / k, step: 70 / k, out: m.out ?? null });
    return { g, page, mark, k };
  }

  // Shrinks a group into the top half when the follow tag arrives.
  function lift(g, t0, o = {}) {
    const { cx = 540, cy = 1000, y = 740, s = 0.5 } = o;
    U.push((time) => {
      const p = eio(prog(time, t0 - 0.25, 0.4));
      g.setAttribute('transform', `translate(${cx} ${lerp(cy, y, p)}) scale(${lerp(1, s, p)}) translate(${-cx} ${-cy})`);
    });
  }

  // The 1.5 second ending of every reel: logo, handle and a Follow button that is pressed.
  // t0 = when it arrives; the button is pressed at o.press (default t0 + 0.95).
  function followTag(parent, t0, o = {}) {
    const { press = t0 + 0.95, handle = '@vipulsingh_ai', platforms = 'Instagram  ·  YouTube', logo = '/logo.png' } = o;
    const hit = (time) => Math.max(0, bump(time - press - 0.05));
    const k = card(parent, 540, 1190, 940, 280, 2, t0, { out: null });
    const lg = $('g', {}, k);
    const img = $('image', { href: logo, x: -116, y: -116, width: 232, height: 232 }, lg);
    pending.push(new Promise((res) => { img.addEventListener('load', res, { once: true }); img.addEventListener('error', res, { once: true }); }));
    U.push((time) => lg.setAttribute('transform', `translate(-338 ${-18 * hit(time)}) rotate(${-3 + Math.sin(time * 1.8) * 1.5})`));
    label(k, -196, 2, handle, { 'font-size': 76, 'text-anchor': 'start' });
    label(k, -192, 64, platforms, { 'font-family': 'Mukta', 'font-weight': 700, 'font-size': 44, 'text-anchor': 'start', opacity: 0.75 });
    const w = 620;
    const cy = 1424;
    const btn = $('g', {}, parent);
    $('rect', { x: -w / 2 + 12, y: -48, width: w, height: 124, rx: 62, fill: INK }, btn);
    const face = $('g', {}, btn);
    const body = $('rect', { x: -w / 2, y: -62, width: w, height: 124, rx: 62, stroke: INK, 'stroke-width': 8 }, face);
    const lab = label(face, 0, 26, '', { 'font-size': 76 });
    stroke(face, [[150, 0], [176, 28], [226, -34]], { t: press + 0.1, d: 0.16, w: 18, color: RED, amp: 2, out: null });
    U.push((time) => {
      const q = time - t0 - 0.1;
      btn.style.display = q < 0 ? 'none' : '';
      const e = eo(clamp(q / 0.28));
      const down = Math.exp(-(((time - press - 0.05) / 0.07) ** 2));
      const done = time >= press + 0.06;
      const bb = bump(time - press - 0.1);
      const pulse = done ? 0 : 0.03 * Math.max(0, Math.sin(q * 10));
      body.setAttribute('fill', done ? MINT : PINK);
      lab.setAttribute('fill', done ? INK : PAPER);
      lab.setAttribute('x', done ? -40 : 0);
      lab.textContent = done ? 'Following' : 'Follow करो';
      face.setAttribute('transform', `translate(${12 * down} ${14 * down})`);
      btn.setAttribute('transform', `translate(540 ${cy + (1 - e) * 320}) rotate(${-2 + (1 - e) * 10}) scale(${1 + 0.06 * bump(q - 0.28) + 0.12 * bb + pulse} ${1 + 0.06 * bump(q - 0.28) - 0.1 * bb + pulse})`);
    });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.26;
      if (Math.sin(a) < -0.4) continue; // keep clear of the card above
      stroke(parent, [[540 + Math.cos(a) * (w / 2 + 50), cy + Math.sin(a) * 112], [540 + Math.cos(a) * (w / 2 + 100), cy + Math.sin(a) * 148]], { t: press + 0.05, d: 0.14, w: 14, color: ORANGE, amp: 2, out: press + 0.5 });
    }
  }

  const frame = (t, extra) => {
    st.boil = Math.floor(t * 7.5) % 3; // line boil on fours
    for (const u of U) u(t, extra);
  };
  return { U, st, stroke, pop, txt, dot, card, captions, sunburst, sticker, mascot, screen, lift, followTag, settled, frame, PAPER, CARD, INK, RED, BLUE, BLUE_LIGHT, PINK, YELLOW, MINT, ORANGE };
}

// Preview only: fit the stage to the window and follow the audio clock.
export function preview(stage, seek) {
  const fit = () => { stage.style.transform = `scale(${Math.min(innerWidth / 1080, innerHeight / 1920)})`; };
  fit();
  addEventListener('resize', fit);
  const au = document.createElement('audio');
  au.src = 'audio/audio.wav';
  au.controls = true;
  au.style.cssText = 'position:fixed;left:8px;bottom:8px;width:300px';
  document.body.appendChild(au);
  const loop = () => { seek(au.currentTime); requestAnimationFrame(loop); };
  loop();
}
