// Story kit (2026-10-12): drawn people, a camera, captions that follow the voice, and the real
// web page that takes over the frame. Everything is a pure function of time: a film calls
// these setters from window.seek(t), and nothing remembers the frame before.
import { hero } from './body.js';

const NS = 'http://www.w3.org/2000/svg';
export const clamp =(x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, p) => a + (b - a) * p;
export const prog = (t, a, d) => clamp((t - a) / d);
export const expoOut = (p) => (p >= 1 ? 1 : 1 - 2 ** (-10 * p));
export const cubicOut = (p) => 1 - (1 - p) ** 3;
export const eio = (p) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);
export const backOut = (p) => 1 + 2.70158 * (p - 1) ** 3 + 1.70158 * (p - 1) ** 2;
export const bump = (x) => (x <= 0 ? 0 : Math.exp(-7 * x) * Math.sin(18 * x));
export const pulse = (t, at, w = 0.08) => Math.exp(-(((t - at) / w) ** 2));
const mix = (a, b, p) => (Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], p)) : lerp(a, b, p));

// Value at time t on a track of keys [[time, value, ease?], ...]; a value is a number or a list.
export function key(t, keys, ease = eio) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1, e] = keys[i];
      return mix(v0, v1, (e ?? ease)((t - t0) / (t1 - t0)));
    }
  }
  return keys[keys.length - 1][1];
}

export function S(tag, attrs = {}, parent, text) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
}
export function H(tag, css, parent, html) {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (html != null) e.innerHTML = html;
  parent.appendChild(e);
  return e;
}
let uid = 0;
export const newId = (p) => `${p}${++uid}`;

export async function setup(fonts, images = []) {
  await document.fonts.ready;
  await Promise.all(fonts.map((f) => document.fonts.load(f, 'अAI')));
  await Promise.all(images.map((src) => new Promise((ok, bad) => {
    const i = new Image();
    i.onload = ok;
    i.onerror = () => bad(new Error('cannot load ' + src));
    i.src = src;
  })));
}

// ---------- camera ----------
// cam(cx, cy, zoom, roll) puts the world point (cx, cy) at the middle of the frame.
export const camera = (group) => (cx, cy, z = 1, roll = 0) =>
  group.setAttribute('transform', `translate(540 960) rotate(${roll}) scale(${z}) translate(${-cx} ${-cy})`);
// Where a world rectangle [x, y, w, h] lands on the frame (roll 0).
export const project = (cx, cy, z, r) => [540 + (r[0] - cx) * z, 960 + (r[1] - cy) * z, r[2] * z, r[3] * z];

// ---------- people ----------
// The elbow of a two-bone arm; of the two answers, the one that points away from the body.
function elbow(sx, sy, hx, hy, a, b, side) {
  let dx = hx - sx;
  let dy = hy - sy;
  let d = Math.hypot(dx, dy) || 1;
  const max = a + b - 2;
  if (d > max) { dx *= max / d; dy *= max / d; d = max; }
  const k = (a * a - b * b + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, a * a - k * k));
  const e1 = [sx + (dx * k - dy * h) / d, sy + (dy * k + dx * h) / d];
  const e2 = [sx + (dx * k + dy * h) / d, sy + (dy * k - dx * h) / d];
  const e = e1[0] * side + e1[1] * 0.35 > e2[0] * side + e2[1] * 0.35 ? e1 : e2;
  return [e[0], e[1], sx + dx, sy + dy];
}

// A person, drawn from the front. Origin: the middle of the hips; the head is about 500 above.
// kind: 'student' (hoodie, short hair) or 'teacher' (long kurta, dupatta, bun, glasses).
// pose({...}) sets everything for one frame.
// face: { dir, meta } puts my own face on the body: one picture per expression from
// brand/face (meta is face.json), chosen with pose({ face: 'grin' }). The drawn eyes, brows
// and mouth are then not used. outline: a colour for an ink line round the body parts, so
// that a drawn body matches a face that has an ink line.
export function person(parent, o = {}) {
  // with my face, the body is the main character's body from body.js (hoodie or shirt);
  // rig: 1 keeps the first, simpler body that #06 and #07 were rendered with
  if (o.face && o.rig !== 1) return hero(parent, o);
  const c = { kind: 'student', skin: '#E3A678', shade: '#C98B60', hair: '#1F1A24', top: '#FF6B4A', topShade: '#E0502F', accent: '#FFD166', legs: '#2E3A6E', face: null, outline: null, ...o };
  const g = S('g', {}, parent);
  const defs = S('defs', {}, g);
  const ol = c.outline ? { stroke: c.outline, 'stroke-width': 6, 'stroke-linejoin': 'round' } : {};
  // an arm is [sleeve, its ink line or null, hand]
  const arm = () => {
    const edge = c.outline ? S('polyline', { fill: 'none', stroke: c.outline, 'stroke-width': 64, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g) : null;
    return [S('polyline', { fill: 'none', stroke: c.topShade, 'stroke-width': 52, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g), edge];
  };
  const hand = () => S('circle', { r: c.face ? 31 : 28, fill: c.skin, ...ol }, g);
  const back = { L: [...arm(), hand()], R: [...arm(), hand()] };

  if (c.kind === 'teacher') {
    S('path', { d: 'M-104,-30 L104,-30 L140,360 Q0,384 -140,360 Z', fill: c.top, ...ol }, g);
    S('path', { d: 'M-126,250 Q0,270 126,250 L130,292 Q0,314 -130,292 Z', fill: c.accent }, g);
  } else {
    S('rect', { x: -84, y: -20, width: 78, height: 380, rx: 30, fill: c.legs, ...ol }, g);
    S('rect', { x: 6, y: -20, width: 78, height: 380, rx: 30, fill: c.legs, ...ol }, g);
  }
  if (c.face) S('rect', { x: -34, y: -372, width: 68, height: 84, fill: c.shade, ...ol }, g);
  S('path', { d: 'M-98,-286 Q-98,-306 -70,-306 L70,-306 Q98,-306 98,-286 L112,-6 Q0,18 -112,-6 Z', fill: c.top, ...ol }, g);
  if (c.kind === 'teacher') {
    S('path', { d: 'M-98,-284 Q-96,-306 -66,-306 L-22,-306 L112,-70 L110,-8 Q88,0 62,4 Z', fill: c.accent }, g);
  } else {
    S('path', { d: 'M0,-262 L0,-10', stroke: c.topShade, 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
    S('path', { d: 'M-58,-104 L58,-104 L48,-34 L-48,-34 Z', fill: c.topShade, opacity: 0.55 }, g);
  }
  if (!c.face) S('rect', { x: -26, y: -340, width: 52, height: 52, fill: c.shade }, g);
  if (c.kind === 'student') S('path', { d: 'M-72,-300 Q0,-236 72,-300 Q40,-322 0,-318 Q-40,-322 -72,-300 Z', fill: c.topShade, ...ol }, g);

  const hd = S('g', {}, g);
  const headY = c.face ? -440 : -405;
  let setFace = null;
  if (c.face) {
    // the head is 250 units wide (the drawn one is 184): a large head carries the expression
    const m = c.face.meta;
    const s = 250 / m.faceWidth;
    const pics = Object.fromEntries(m.names.map((n) => [n, S('image', { href: `${c.face.dir}${n}.png`, x: -m.centre * s, y: 112 - m.chin.neutral * s, width: m.size[0] * s, height: m.size[1] * s }, hd)]));
    setFace = (name) => { const pick = pics[name] ? name : 'neutral'; for (const n in pics) pics[n].style.display = n === pick ? '' : 'none'; };
  }
  const drawn = c.face ? null : (() => {
  if (c.kind === 'teacher') S('circle', { cx: 0, cy: -132, r: 50, fill: c.hair }, hd);
  S('circle', { cx: -93, cy: 10, r: 21, fill: c.skin }, hd);
  S('circle', { cx: 93, cy: 10, r: 21, fill: c.skin }, hd);
  S('rect', { x: -92, y: -100, width: 184, height: 204, rx: 86, fill: c.skin }, hd);
  S('circle', { cx: -58, cy: 44, r: 21, fill: '#FF7A6B', opacity: 0.32 }, hd);
  S('circle', { cx: 58, cy: 44, r: 21, fill: '#FF7A6B', opacity: 0.32 }, hd);
  if (c.kind === 'teacher') {
    S('path', { d: 'M-101,14 C-124,-116 -44,-142 0,-116 C44,-142 124,-116 101,14 C98,-34 74,-72 0,-84 C-74,-72 -98,-34 -101,14 Z', fill: c.hair }, hd);
    S('circle', { cx: 0, cy: -50, r: 6.5, fill: '#D62246' }, hd);
  } else {
    S('path', { d: 'M-101,2 C-124,-116 -56,-152 4,-136 C66,-162 130,-104 101,2 C96,-44 78,-66 40,-62 C10,-90 -38,-84 -64,-60 C-84,-44 -96,-26 -101,2 Z', fill: c.hair }, hd);
  }
  const eye = (x) => {
    const cid = newId('eye');
    const ce = S('ellipse', { cx: x, cy: -4, rx: 21, ry: 23 }, S('clipPath', { id: cid }, defs));
    const white = S('ellipse', { cx: x, cy: -4, rx: 21, ry: 23, fill: '#fff' }, hd);
    const pg = S('g', { 'clip-path': `url(#${cid})` }, hd);
    const pupil = S('circle', { r: 11.5, fill: '#231A2B' }, pg);
    const shine = S('circle', { r: 3.8, fill: '#fff' }, pg);
    const shut = S('path', { d: `M${x - 19},-4 q19,13 38,0`, fill: 'none', stroke: c.hair, 'stroke-width': 7, 'stroke-linecap': 'round' }, hd);
    return (open, lx, ly) => {
      const closed = open < 0.2;
      white.style.display = pg.style.display = closed ? 'none' : '';
      shut.style.display = closed ? '' : 'none';
      const ry = 23 * Math.min(open, 1.35);
      ce.setAttribute('ry', ry);
      white.setAttribute('ry', ry);
      white.setAttribute('rx', 21 * (open > 1 ? 1 + (open - 1) * 0.4 : 1));
      pupil.setAttribute('cx', x + lx * 8.5);
      pupil.setAttribute('cy', -4 + ly * 8);
      pupil.setAttribute('r', open > 1 ? 10 : 11.5);
      shine.setAttribute('cx', x + lx * 8.5 + 4);
      shine.setAttribute('cy', -4 + ly * 8 - 4);
    };
  };
  const eyeL = eye(-38);
  const eyeR = eye(38);
  const brow = (x) => S('path', { d: 'M-19,0 L19,0', fill: 'none', stroke: c.hair, 'stroke-width': 9, 'stroke-linecap': 'round' }, hd);
  const browL = brow(-38);
  const browR = brow(38);
  S('path', { d: 'M-3,14 q9,10 -3,19', fill: 'none', stroke: c.shade, 'stroke-width': 6, 'stroke-linecap': 'round' }, hd);
  if (c.kind === 'teacher') {
    for (const x of [-38, 38]) S('circle', { cx: x, cy: -4, r: 31, fill: 'rgba(255,255,255,.16)', stroke: '#2B2338', 'stroke-width': 6 }, hd);
    S('path', { d: 'M-8,-6 L8,-6', stroke: '#2B2338', 'stroke-width': 6 }, hd);
  }
  const lips = S('path', { fill: 'none', stroke: '#7A2233', 'stroke-width': 7.5, 'stroke-linecap': 'round' }, hd);
  const gape = S('path', { fill: '#7A2233' }, hd);
  return { eyeL, eyeR, browL, browR, lips, gape };
  })();
  const front = { L: [...arm(), hand()], R: [...arm(), hand()] };

  const setArm = (which, side, target, behind) => {
    const [ex, ey, hx, hy] = elbow(side * 86, -276, target[0], target[1], 118, 112, side);
    for (const [layer, on] of [[back, behind], [front, !behind]]) {
      const [line, edge, palm] = layer[which];
      const points = `${side * 86},-276 ${ex},${ey} ${hx},${hy}`;
      for (const e of [line, edge, palm]) if (e) e.style.display = on ? '' : 'none';
      if (!on) continue;
      line.setAttribute('points', points);
      if (edge) edge.setAttribute('points', points);
      palm.setAttribute('cx', hx);
      palm.setAttribute('cy', hy);
    }
  };

  return {
    g,
    pose(p = {}) {
      const q = { x: 0, y: 0, s: 1, flip: false, lean: 0, tilt: 0, hx: 0, hy: 0, face: 'neutral', pop: 1, look: [0, 0], eye: 1, eyeL: null, eyeR: null, brow: [0, 0], browY: 0, smile: 1, open: 0, mw: 26, handL: [-130, -64], handR: [130, -64], backL: false, backR: false, ...p };
      g.setAttribute('transform', `translate(${q.x} ${q.y}) scale(${q.flip ? -q.s : q.s} ${q.s}) rotate(${q.lean})`);
      if (setFace) {
        // the head turns about the chin; pop (1 = rest) squashes it for a beat when the face changes
        hd.setAttribute('transform', `translate(${q.hx} ${headY + q.hy}) rotate(${q.tilt} 0 100) translate(0 112) scale(${2 - q.pop} ${q.pop}) translate(0 -112)`);
        setFace(q.face);
      } else {
        const { eyeL, eyeR, browL, browR, lips, gape } = drawn;
        hd.setAttribute('transform', `translate(${q.hx} ${headY + q.hy}) rotate(${q.tilt})`);
        eyeL(q.eyeL ?? q.eye, q.look[0], q.look[1]);
        eyeR(q.eyeR ?? q.eye, q.look[0], q.look[1]);
        browL.setAttribute('transform', `translate(-38 ${-42 + q.browY}) rotate(${q.brow[0]})`);
        browR.setAttribute('transform', `translate(38 ${-42 + q.browY}) rotate(${q.brow[1]})`);
        const w = q.mw;
        const wide = q.open > 0.05;
        lips.style.display = wide ? 'none' : '';
        gape.style.display = wide ? '' : 'none';
        if (wide) gape.setAttribute('d', `M${-w},58 Q0,${58 - 6 * q.open} ${w},58 Q${w * 0.92},${58 + q.open * 40 + q.smile * 12} 0,${58 + q.open * 46 + q.smile * 14} Q${-w * 0.92},${58 + q.open * 40 + q.smile * 12} ${-w},58 Z`);
        else lips.setAttribute('d', `M${-w},${58 - q.smile * 5} Q0,${58 + q.smile * 24} ${w},${58 - q.smile * 5}`);
      }
      setArm('L', -1, q.handL, q.backL);
      setArm('R', 1, q.handR, q.backR);
    },
  };
}

// ---------- compact captions (from 2026-10-15) ----------
// I said the band captions hid too much of the picture. These show a few words at a time on
// one line, with no band: white type with a dark outline, the spoken word in yellow.
// items: [{ words: [{ word, t }], a, b, whole }]; whole: true shows the whole sentence at once
// (the hook, so that it is readable on frame 0), on at most two lines.
export function captionsCompact(root, items, o = {}) {
  const c = { bottom: 1490, size: 66, maxChars: 18, ink: '#0F1230', mark: '#FFD23F', font: '"Anek Devanagari"', ...o };
  const edge = [[-4, -4], [4, -4], [-4, 4], [4, 4], [0, -5], [0, 5], [-5, 0], [5, 0], [0, 9], [-3, 9], [3, 9]].map(([x, y]) => `${x}px ${y}px 0 ${c.ink}`).join(',');
  const chunks = [];
  for (const it of items) {
    const groups = [];
    if (it.whole) groups.push(it.words);
    else {
      let cur = [];
      let n = 0;
      for (const w of it.words) {
        if (cur.length && n + w.word.length + 1 > c.maxChars) { groups.push(cur); cur = []; n = 0; }
        cur.push(w);
        n += w.word.length + 1;
      }
      if (cur.length) groups.push(cur);
    }
    groups.forEach((ws, i) => {
      const a = i === 0 ? it.a : ws[0].t - 0.05;
      const b = i < groups.length - 1 ? groups[i + 1][0].t - 0.05 : it.b;
      const box = H('div', `position:absolute;left:70px;width:940px;bottom:${1920 - c.bottom}px;text-align:center;text-wrap:balance;font:800 ${c.size}px/1.18 ${c.font};font-stretch:90%;color:#fff;text-shadow:${edge};transform-origin:50% 100%;visibility:hidden`, root);
      const spans = ws.map((w) => ({ e: H('span', 'display:inline-block;margin:0 .14em;transform-origin:50% 70%', box, w.word), t: w.t }));
      chunks.push({ box, spans, a, b, first: it.a <= 0 && i === 0 });
    });
  }
  return (t) => {
    for (const k of chunks) {
      const on = t >= k.a - 0.02 && t < k.b;
      k.box.style.visibility = on ? 'visible' : 'hidden';
      if (!on) continue;
      k.box.style.transform = k.first ? 'none' : `scale(${lerp(0.82, 1, backOut(prog(t, k.a - 0.02, 0.16)))})`;
      let i = -1;
      k.spans.forEach((s, n) => { if (t >= s.t - 0.04) i = n; });
      k.spans.forEach((s, n) => {
        const hot = n === i;
        s.e.style.color = hot ? c.mark : '#fff';
        s.e.style.transform = hot ? `scale(${1 + 0.1 * (1 - prog(t, s.t - 0.04, 0.2))})` : 'none';
      });
    }
  };
}

// ---------- captions ----------
// items: [{ words: [{ word, t }], a, b }]. One caption is on screen from a to b, on dark bands
// near the bottom of the safe area; a yellow marker moves to the word that is being spoken.
export function captions(root, items, o = {}) {
  const c = { bottom: 1500, size: 86, band: '#0F1230', mark: '#FFD23F', ink: '#0F1230', font: '"Anek Devanagari"', ...o };
  const built = items.map((it) => {
    const box = H('div', `position:absolute;left:50px;width:980px;bottom:${1920 - c.bottom}px;text-align:center;text-wrap:balance;isolation:isolate;font:800 ${c.size}px/1.5 ${c.font};font-stretch:88%;color:#fff;transform-origin:50% 100%`, root);
    const band = H('span', `background:${c.band};padding:.1em .3em .02em;border-radius:22px;-webkit-box-decoration-break:clone;box-decoration-break:clone`, box);
    const mark = H('div', `position:absolute;left:0;top:0;background:${c.mark};border-radius:16px;z-index:1`, box);
    const words = it.words.map((x, i) => ({ e: H('span', 'display:inline-block;position:relative;z-index:2;padding:0 .1em', band, x.word), t: x.t, gap: i < it.words.length - 1 ? band.appendChild(document.createTextNode(' ')) : null }));
    const rect = (x) => [x.e.offsetLeft - 4, x.e.offsetTop + x.e.offsetHeight * 0.1, x.e.offsetWidth + 8, x.e.offsetHeight * 0.8];
    return { ...it, box, mark, words, rect };
  });
  return (t) => {
    for (const it of built) {
      const on = t >= it.a - 0.02 && t < it.b;
      it.box.style.visibility = on ? 'visible' : 'hidden';
      if (!on) continue;
      it.box.style.transform = it.a <= 0 ? 'none' : `scale(${lerp(0.8, 1, backOut(prog(t, it.a - 0.02, 0.22)))})`;
      let i = 0;
      while (i < it.words.length - 1 && t >= it.words[i + 1].t - 0.04) i++;
      const p = i === 0 ? 1 : expoOut(prog(t, it.words[i].t - 0.04, 0.18));
      const r = mix(it.rect(it.words[Math.max(0, i - 1)]), it.rect(it.words[i]), p);
      it.mark.style.transform = `translate(${r[0]}px,${r[1]}px)`;
      it.mark.style.width = `${r[2]}px`;
      it.mark.style.height = `${r[3]}px`;
      it.words.forEach((x, n) => { x.e.style.color = n === i && p > 0.5 ? c.ink : '#fff'; });
    }
  };
}

// ---------- the real web page ----------
// A captured page (one tall image, imgW wide) drawn 1080 wide inside a frame rectangle.
// set({ rect, scroll, zoom, fx, fy, slide, radius }): rect [x, y, w, h] on the frame; scroll in
// image pixels; zoom about the point (fx, fy) of the 1080-wide view; slide moves the page down.
// kids: things that must stick to the page (a ring round a heading) go into `page.sheet`.
export function webpage(root, src, imgW = 824) {
  const k = 1080 / imgW;
  const outer = H('div', 'position:absolute;left:0;top:0;overflow:hidden;background:#fff;visibility:hidden', root);
  const inner = H('div', 'position:absolute;left:0;top:0;width:1080px;transform-origin:0 0', outer);
  const sheet = H('div', `position:absolute;left:0;top:0;width:1080px;height:4000px;background:url(${src}) 0 0/1080px auto no-repeat`, inner);
  // `pins` scrolls with the page: its children sit at page positions (image pixels times k)
  const pins = H('div', 'position:absolute;left:0;top:0;width:1080px;height:0', sheet);
  return {
    k, sheet, pins,
    hide() { outer.style.visibility = 'hidden'; },
    set({ rect, scroll = 0, zoom = 1, fx = 540, fy = 960, slide = 0, radius = 0 }) {
      const s = rect[2] / 1080;
      outer.style.visibility = 'visible';
      outer.style.transform = `translate(${rect[0]}px,${rect[1]}px)`;
      outer.style.width = `${rect[2]}px`;
      outer.style.height = `${rect[3]}px`;
      outer.style.borderRadius = `${radius}px`;
      inner.style.transform = `scale(${s})`;
      sheet.style.backgroundPosition = `0 ${-scroll * k}px`;
      pins.style.transform = `translateY(${-scroll * k}px)`;
      sheet.style.transformOrigin = `${fx}px ${fy}px`;
      sheet.style.transform = `translateY(${slide}px) scale(${zoom})`;
    },
    // y of an image row inside the sheet, for things that stick to the page
    y: (imgY, scroll = 0) => (imgY - scroll) * k,
  };
}

// A mouse pointer whose tip is at the element's top-left corner (HTML, frame space).
export const pointer = (root, fill = '#14151A', stroke = '#fff', size = 120) =>
  H('div', 'position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform', root,
    `<svg width="${size}" height="${size * 1.36}" viewBox="-8 -8 110 150" style="display:block;margin:-${size * 0.073}px 0 0 -${size * 0.073}px"><path d="M0 0 L0 110 L30 82 L52 132 L74 122 L52 74 L92 74Z" fill="${fill}" stroke="${stroke}" stroke-width="9" stroke-linejoin="round"/></svg>`);

// Sets window.DUR / seek / ready. In a browser tab (no ?render) it also plays with the sound.
export function start(stage, U, dur) {
  window.DUR = dur;
  window.seek = (t) => { for (const u of U) u(t); };
  window.seek(0);
  window.ready = true;
  if (new URLSearchParams(location.search).has('render')) return;
  const fit = () => { stage.style.transform = `scale(${Math.min(innerWidth / 1080, innerHeight / 1920)})`; };
  fit();
  addEventListener('resize', fit);
  const au = H('audio', 'position:fixed;left:8px;bottom:8px;width:300px', document.body);
  au.src = 'audio/audio.wav';
  au.controls = true;
  const loop = () => { window.seek(au.currentTime); requestAnimationFrame(loop); };
  loop();
}
