// Scenes and endings that every story reel can use (first used in #07): the room at night
// seen over the shoulder, the desk seen from the front, the tool-link line and the follow
// card. A film draws its own things on top (what is on the laptop screen, extra props).
// Everything is a pure function of time; nothing remembers the frame before.
import { H, S, backOut, bump, camera, cubicOut, expoOut, person, prog, pulse } from './story.js';
import { OUTFITS } from './body.js';

export const NAVY = '#0F1230';
export const BLUE = '#2F5BFF';
export const CORAL = '#FF4D6D';
export const INK = '#1E1410';
export const show = (e, on) => { e.style.display = on ? '' : 'none'; return on; };
export const star = (parent, x, y, r, fill) => S('path', { d: `M0,${-r} Q0,0 ${r},0 Q0,0 0,${r} Q0,0 ${-r},0 Q0,0 0,${-r} Z`, fill, transform: `translate(${x} ${y})` }, parent);

// Gradients for light (a screen, a lamp) and blur filters for fast sideways moves.
export function lights(svg) {
  const defs = S('defs', {}, svg);
  const grad = (id, kind, attrs, stops) => { const g = S(kind, { id, ...attrs }, defs); stops.forEach(([o, c, a]) => S('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, g)); };
  grad('glow', 'radialGradient', {}, [[0, '#8EA6FF', 0.62], [1, '#8EA6FF', 0]]);
  grad('cone', 'linearGradient', { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, '#FFC94A', 0.5], [1, '#FFC94A', 0]]);
  grad('beam', 'linearGradient', { x1: 0, y1: 1, x2: 0, y2: 0 }, [[0, '#8EA6FF', 0.55], [1, '#8EA6FF', 0]]);
  const blurOf = (id) => ({ id, fe: S('feGaussianBlur', { stdDeviation: '0 0' }, S('filter', { id, x: '-30%', width: '160%', y: '0', height: '100%' }, defs)) });
  return { defs, blurOf };
}
// A scene leaves or arrives in a fast sideways move, blurred along the move.
export const whip = (g, blur, x, speed) => {
  g.setAttribute('transform', `translate(${x} 0)`);
  if (speed > 2) { blur.fe.setAttribute('stdDeviation', `${speed} 0`); g.setAttribute('filter', `url(#${blur.id})`); } else g.removeAttribute('filter');
};
// x and blur of a scene that comes in at t0 from one side (dir 1 = from the right)
export const whipIn = (g, blur, t, t0, dir = 1) => {
  const p = prog(t, t0, 0.42);
  whip(g, blur, dir * 1500 * (1 - expoOut(p)), p < 1 ? 80 * (1 - p) ** 2 : 0);
};
// ... and of one that leaves, ending at t1 (dir 1 = to the right)
export const whipOut = (g, blur, t, t1, dir = 1) => {
  const p = prog(t, t1 - 0.3, 0.3);
  whip(g, blur, dir * 1500 * p ** 3, 90 * p * p);
};

// The wall of the room at night: a window with the moon, and the clock at 2:00.
export function nightWall(w) {
  S('rect', { x: -500, y: -500, width: 2080, height: 3000, fill: '#1A1F4B' }, w);
  const win = S('g', { transform: 'translate(64 300)' }, w);
  S('rect', { width: 380, height: 300, rx: 16, fill: '#343E80' }, win);
  S('rect', { x: 16, y: 16, width: 348, height: 268, rx: 6, fill: '#0A0F33' }, win);
  S('circle', { cx: 270, cy: 104, r: 52, fill: '#FFE7A3' }, win);
  S('circle', { cx: 294, cy: 86, r: 46, fill: '#0A0F33' }, win);
  const stars = [[64, 70, 9], [128, 196, 7], [176, 58, 6], [318, 226, 8], [84, 246, 6]].map(([x, y, r]) => ({ e: star(win, 0, 0, r, '#fff'), x, y }));
  S('rect', { x: 182, y: 16, width: 16, height: 268, fill: '#343E80' }, win);
  S('rect', { x: 16, y: 142, width: 348, height: 16, fill: '#343E80' }, win);
  const clock = S('g', { transform: 'translate(846 446)' }, w);
  S('circle', { r: 108, fill: '#343E80' }, clock);
  S('circle', { r: 90, fill: '#F3EFE6' }, clock);
  for (let i = 0; i < 12; i++) S('path', { d: 'M0,-80 L0,-68', stroke: '#1A1F4B', 'stroke-width': i % 3 ? 4 : 8, 'stroke-linecap': 'round', transform: `rotate(${i * 30})` }, clock);
  S('path', { d: 'M0,0 L0,-44', stroke: '#1A1F4B', 'stroke-width': 11, 'stroke-linecap': 'round', transform: 'rotate(60)' }, clock);
  S('path', { d: 'M0,0 L0,-66', stroke: '#1A1F4B', 'stroke-width': 8, 'stroke-linecap': 'round' }, clock);
  const second = S('path', { d: 'M0,14 L0,-72', stroke: CORAL, 'stroke-width': 4, 'stroke-linecap': 'round' }, clock);
  S('circle', { r: 9, fill: '#1A1F4B' }, clock);
  return (t) => {
    stars.forEach((s, i) => s.e.setAttribute('transform', `translate(${s.x} ${s.y}) scale(${0.7 + 0.4 * Math.sin(t * 5 + i * 2)})`));
    second.setAttribute('transform', `rotate(${t * 40})`);
  };
}

// The same wall by day (from #11): the window shows sky, sun and drifting clouds, the clock is
// at 11:00. Same places as nightWall, so a film can swap one for the other.
export function dayWall(w) {
  S('rect', { x: -500, y: -500, width: 2080, height: 3000, fill: '#FFE3BF' }, w);
  S('path', { d: 'M520,-500 L1060,-500 L800,1500 L260,1500 Z', fill: '#FFF1DC', opacity: 0.7 }, w);
  const win = S('g', { transform: 'translate(64 300)' }, w);
  S('rect', { width: 380, height: 300, rx: 16, fill: '#FFFFFF', stroke: INK, 'stroke-width': 6 }, win);
  S('rect', { x: 16, y: 16, width: 348, height: 268, rx: 6, fill: '#BFE3FF' }, win);
  const sun = S('circle', { cx: 280, cy: 90, r: 42, fill: '#FFD23F' }, win);
  const clouds = [[60, 90, 1], [200, 200, 0.8]].map(([x, y, k]) => {
    const g = S('g', {}, win);
    for (const [dx, dy, r] of [[0, 0, 24], [26, -10, 30], [56, 0, 24]]) S('circle', { cx: dx, cy: dy, r: r * k, fill: '#fff' }, g);
    return { g, x, y };
  });
  S('rect', { x: 182, y: 16, width: 16, height: 268, fill: '#FFFFFF' }, win);
  S('rect', { x: 16, y: 142, width: 348, height: 16, fill: '#FFFFFF' }, win);
  const clock = S('g', { transform: 'translate(846 446)' }, w);
  S('circle', { r: 108, fill: '#2F5BFF', stroke: INK, 'stroke-width': 6 }, clock);
  S('circle', { r: 90, fill: '#FFFDF6' }, clock);
  for (let i = 0; i < 12; i++) S('path', { d: 'M0,-80 L0,-68', stroke: '#1A1F4B', 'stroke-width': i % 3 ? 4 : 8, 'stroke-linecap': 'round', transform: `rotate(${i * 30})` }, clock);
  S('path', { d: 'M0,0 L0,-44', stroke: '#1A1F4B', 'stroke-width': 11, 'stroke-linecap': 'round', transform: 'rotate(330)' }, clock);
  S('path', { d: 'M0,0 L0,-66', stroke: '#1A1F4B', 'stroke-width': 8, 'stroke-linecap': 'round' }, clock);
  const second = S('path', { d: 'M0,14 L0,-72', stroke: CORAL, 'stroke-width': 4, 'stroke-linecap': 'round' }, clock);
  S('circle', { r: 9, fill: '#1A1F4B' }, clock);
  return (t) => {
    clouds.forEach((c) => c.g.setAttribute('transform', `translate(${((c.x + t * 14) % 420) - 40} ${c.y})`));
    sun.setAttribute('r', 42 + 2 * Math.sin(t * 2));
    second.setAttribute('transform', `rotate(${t * 40})`);
  };
}
const FLOOR = { night: ['#2A2150', '#43387F'], day: ['#E2C9A0', '#CFAF7E'] };

// The room at night, over my shoulder. Returns { s, w, cam, blur, SCREEN, scr, glow, tick }.
// scr is the laptop screen, 728 x 500, clipped: draw what is on the screen into it.
// tick(t, { sink, jump }) moves the small things; sink (0..1) lets the head drop, jump lifts it.
export function room(svg, L, me) {
  const s = S('g', {}, svg);
  const w = S('g', {}, s);
  const SCREEN = [176, 586, 728, 500];
  const night = nightWall(w);
  const glow = S('ellipse', { cx: 540, cy: 860, rx: 760, ry: 660, fill: 'url(#glow)' }, w);
  S('path', { d: 'M1000,690 L1130,700 L1260,1190 L820,1190 Z', fill: 'url(#cone)' }, w);
  S('path', { d: 'M1100,580 L1150,250', stroke: '#8088B8', 'stroke-width': 16, 'stroke-linecap': 'round' }, w);
  S('path', { d: 'M968,610 L1110,560 L1150,706 L996,700 Z', fill: '#FFC94A' }, w);
  S('rect', { x: -500, y: 1180, width: 2080, height: 1500, fill: '#2A2150' }, w);
  S('rect', { x: -500, y: 1180, width: 2080, height: 16, fill: '#43387F' }, w);
  S('path', { d: 'M118,1120 q44,26 0,58', fill: 'none', stroke: '#FF6B4A', 'stroke-width': 16 }, w);
  S('rect', { x: 26, y: 1084, width: 98, height: 108, rx: 16, fill: '#FF6B4A' }, w);
  const steam = [52, 92].map((x) => S('path', { d: `M${x},1064 q-14,-22 0,-44 q14,-22 0,-44`, fill: 'none', stroke: '#fff', 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0.4 }, w));
  S('rect', { x: 150, y: 560, width: 780, height: 566, rx: 30, fill: '#0B0E24' }, w);
  S('rect', { x: SCREEN[0], y: SCREEN[1], width: SCREEN[2], height: SCREEN[3], rx: 8 }, S('clipPath', { id: 'scr' }, L.defs));
  const scr = S('g', { transform: `translate(${SCREEN[0]} ${SCREEN[1]})` }, S('g', { 'clip-path': 'url(#scr)' }, w));
  S('rect', { width: 728, height: 500, fill: '#fff' }, scr);
  S('path', { d: 'M96,1126 L984,1126 L1054,1218 L26,1218 Z', fill: '#B4BCD6' }, w);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 11; k++) S('rect', { x: 150 - r * 20 + k * (71.5 + r * 3.6), y: 1140 + r * 24, width: 56 + r * 3, height: 15, rx: 5, fill: '#8D97B9' }, w);
  const top = S('g', {}, w); // for things in front of the laptop but behind my head (a pointer)
  const back = S('g', {}, w);
  const wear = OUTFITS[me.outfit] ?? OUTFITS.hoodie; // the same clothes as the body in body.js
  S('path', { d: 'M-120,2000 Q-90,1730 110,1700 L430,1700 Q630,1730 660,2000 Z', fill: wear.mid, stroke: '#2A1A12', 'stroke-width': 5 }, back);
  S('path', { d: 'M96,1716 Q270,1820 444,1716 Q270,1650 96,1716 Z', fill: wear.dark, stroke: '#2A1A12', 'stroke-width': 5 }, back);
  S('rect', { x: 206, y: 1620, width: 128, height: 96, fill: me.shade }, back);
  S('ellipse', { cx: 64, cy: 1530, rx: 28, ry: 42, fill: me.skin, stroke: INK, 'stroke-width': 6 }, back);
  S('ellipse', { cx: 476, cy: 1530, rx: 28, ry: 42, fill: me.skin, stroke: INK, 'stroke-width': 6 }, back);
  S('ellipse', { cx: 270, cy: 1500, rx: 204, ry: 218, fill: '#1F1A24' }, back);
  S('path', { d: 'M150,1310 C190,1240 300,1230 330,1300 Z', fill: '#1F1A24' }, back);
  S('path', { d: 'M318,1296 Q470,1330 470,1470', fill: 'none', stroke: '#9DB2FF', 'stroke-width': 12, 'stroke-linecap': 'round', opacity: 0.6 }, back);
  return {
    s, w, cam: camera(w), blur: L.blurOf('mbRoom'), SCREEN, scr, top, glow,
    tick(t, { sink = 0, jump = 0 } = {}) {
      night(t);
      steam.forEach((e, i) => e.setAttribute('transform', `translate(${6 * Math.sin(t * 3 + i * 2)} ${-8 * ((t * 0.9 + i * 0.5) % 1)})`));
      glow.setAttribute('opacity', 0.78 + 0.04 * Math.sin(t * 7));
      back.setAttribute('transform', `translate(${5 * Math.sin(t * 1.7)} ${40 * sink - 46 * jump + 6 * Math.sin(t * 2.3)}) rotate(${7 * sink} 270 1720)`);
    },
  };
}

// The desk from the front: me behind the laptop. At night (default) it is lit by the screen and
// a lamp; with { day: true } it is a bright room with the sun in the window (from #11).
// Returns { s, w, cam, blur, kid, behind, props, tick }; props is a layer in front of everything.
// kid.pose(...) is the film's job: the body stands at x 540, y 1640, s 1.5.
export function desk(svg, L, me, o = {}) {
  const s = S('g', {}, svg);
  const w = S('g', {}, s);
  const night = o.day ? dayWall(w) : nightWall(w);
  const glow = S('ellipse', { cx: 540, cy: 1150, rx: 620, ry: 560, fill: 'url(#glow)' }, w);
  if (!o.day) {
    S('path', { d: 'M-40,720 L90,700 L260,1500 L-200,1500 Z', fill: 'url(#cone)' }, w);
    S('path', { d: 'M-70,600 L96,566 L130,712 L-60,720 Z', fill: '#FFC94A' }, w);
  }
  const beam = S('path', { d: 'M300,1250 L780,1250 L960,620 L120,620 Z', fill: 'url(#beam)' }, w);
  const behind = S('g', {}, w); // props behind me
  const kid = person(w, me);
  const [floor, edge] = FLOOR[o.day ? 'day' : 'night'];
  S('rect', { x: -500, y: 1500, width: 2080, height: 1200, fill: floor }, w);
  S('rect', { x: -500, y: 1500, width: 2080, height: 16, fill: edge }, w);
  S('path', { d: 'M296,1250 L784,1250 Q806,1250 806,1272 L806,1504 L274,1504 L274,1272 Q274,1250 296,1250 Z', fill: '#B4BCD6', stroke: INK, 'stroke-width': 6 }, w);
  S('rect', { x: 240, y: 1500, width: 600, height: 24, rx: 10, fill: '#8D97B9' }, w);
  star(w, 540, 1380, 44, '#FFD166');
  S('path', { d: 'M938,1436 q44,26 0,58', fill: 'none', stroke: '#FF6B4A', 'stroke-width': 16 }, w);
  S('rect', { x: 846, y: 1400, width: 98, height: 108, rx: 16, fill: '#FF6B4A' }, w);
  const props = S('g', {}, w);
  return {
    s, w, cam: camera(w), blur: L.blurOf('mbDesk'), kid, behind, props,
    tick(t, bright = 0) {
      night(t);
      const k = o.day ? 0.25 : 1; // by day the screen light is faint
      glow.setAttribute('opacity', k * (0.85 + 0.06 * Math.sin(t * 7) + 0.4 * bright));
      beam.setAttribute('opacity', k * (0.7 + 0.3 * bright + 0.08 * Math.sin(t * 9)));
    },
  };
}

// The tool-link line: "इस tool का link चाहिए? Comment में कुछ भी लिख दो।" A chip with the
// link is held out, then a comment bar comes up, "link" is typed and Post is pressed.
// set(t, { link, comment, post, away }): the times of the two sentences, of the press, and
// of the moment both leave. Post is at about (935, 1250) for the pointer.
export function linkLine(stage, label) {
  const chip = H('div', `position:absolute;left:34px;top:880px;height:104px;padding:0 34px 0 26px;display:flex;align-items:center;gap:16px;background:#fff;border:6px solid ${INK};border-radius:999px;box-shadow:0 12px 0 rgba(15,18,48,.25);box-sizing:border-box;font:800 54px/1 'Anek Devanagari';font-stretch:88%;color:${NAVY};transform-origin:60% 100%;white-space:nowrap`, stage,
    `<svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="${BLUE}" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg><span style="padding-top:10px">${label}</span>`);
  const bar = H('div', `position:absolute;left:60px;top:1180px;width:960px;height:112px;display:flex;align-items:center;gap:24px;padding:0 40px 0 20px;background:#fff;border:6px solid ${INK};border-radius:999px;box-shadow:0 12px 0 rgba(15,18,48,.25);box-sizing:border-box;font:600 52px/1 'Anek Devanagari';color:${NAVY}`, stage,
    `<div style="width:72px;height:72px;border-radius:50%;background:#C9CEDA;flex:none"></div><div style="flex:1;padding-top:10px;white-space:pre"></div>`);
  const typed = bar.children[1];
  const post = H('div', `font:800 50px/1 'Anek Devanagari';color:${BLUE};padding-top:10px`, bar, 'Post');
  return {
    set(t, T) {
      const away = prog(t, T.away - 0.14, 0.14);
      const c1 = backOut(prog(t, T.link + 0.12, 0.3)) * (1 - away);
      chip.style.visibility = c1 > 0 ? 'visible' : 'hidden';
      chip.style.transform = `scale(${c1}) rotate(${-5 + 2.5 * Math.sin(t * 5)}deg)`;
      const c2 = expoOut(prog(t, T.comment - 0.1, 0.35));
      bar.style.visibility = c2 > 0 && away < 1 ? 'visible' : 'hidden';
      bar.style.transform = `translateY(${(1 - c2) * 800 + away * 800}px) scale(${1 + 0.03 * Math.max(0, bump(t - T.post))})`;
      typed.textContent = 'link'.slice(0, Math.round(prog(t, T.comment + 0.2, 0.42) * 4)) + (t < T.post && Math.floor(t * 5) % 2 ? '|' : ' ');
      post.style.transform = `scale(${1 - 0.14 * pulse(t, T.post + 0.02, 0.07)})`;
    },
  };
}

// The follow card: logo, handle and a Follow button that is pressed. It drops in at `at`
// and the button is pressed at `press`. The button is at about (900, 420) for the pointer.
// From 2026-10-16 (the AI जुगाड़ series): o.next puts a yellow tag under the card that swings
// in after the press ("अगला AI जुगाड़: #2"); set(t, at, press, away) with `away` sends the card
// back up, for a follow ask in the middle of a reel.
export function followCard(stage, o = {}) {
  const c = { handle: '@vipulsingh_ai', line: 'AI tools, आसान हिंदी में', logo: '/logo.png', ...o };
  const card = H('div', 'position:absolute;left:50px;top:286px;width:980px;height:236px;background:#fff;border-radius:64px;box-shadow:0 16px 0 rgba(15,18,48,.22);display:flex;align-items:center;gap:28px;padding:0 34px;box-sizing:border-box', stage,
    `<img src="${c.logo}" style="width:156px;height:156px;border-radius:50%;object-fit:cover;border:8px solid #FFD23F;box-sizing:border-box">` +
    `<div style="flex:1;white-space:nowrap"><div style="font:800 56px/1.15 'Anek Devanagari';font-stretch:88%;color:${NAVY}">${c.handle}</div><div style="font:600 36px/1.2 'Anek Devanagari';color:#5B6070">${c.line}</div></div>`);
  const btn = H('div', `font:800 50px/1 'Anek Devanagari';color:#fff;background:${BLUE};padding:32px 44px 22px;border-radius:999px;white-space:nowrap`, card, 'Follow');
  const tag = c.next ? H('div', `position:absolute;left:150px;top:540px;padding:22px 36px 12px;background:#FFD23F;border:6px solid ${INK};border-radius:28px;box-shadow:0 10px 0 rgba(15,18,48,.25);font:800 50px/1 'Anek Devanagari';font-stretch:88%;color:${NAVY};white-space:nowrap;transform-origin:50% 0`, stage, c.next) : null;
  return {
    set(t, at, press, away = Infinity) {
      const p = backOut(prog(t, at, 0.4));
      const out = cubicOut(prog(t, away, 0.35));
      card.style.visibility = p > 0 && out < 1 ? 'visible' : 'hidden';
      card.style.transform = `translateY(${(1 - p) * -620 - out * 700}px) rotate(${(1 - p) * -5 + out * 6}deg) scale(${1 + 0.03 * Math.max(0, bump(t - press))})`;
      const done = t >= press + 0.02;
      btn.textContent = done ? 'Following ✓' : 'Follow';
      btn.style.background = done ? NAVY : BLUE;
      btn.style.transform = `scale(${1 - 0.1 * pulse(t, press + 0.02, 0.07)})`;
      if (tag) {
        const q = backOut(prog(t, press + 0.15, 0.4));
        tag.style.visibility = q > 0 && out < 1 ? 'visible' : 'hidden';
        tag.style.transform = `translateY(${-out * 700}px) rotate(${(1 - q) * -40 + 4 * Math.sin(t * 3)}deg) scale(${q})`;
      }
    },
  };
}

// A paper plane that flies along a curve from a to b (world points) between t0 and t1.
export function paperPlane(parent, a, mid, b) {
  const trail = S('path', { d: `M${a[0]},${a[1]} Q${mid[0]},${mid[1]} ${b[0]},${b[1]}`, fill: 'none', stroke: '#fff', 'stroke-width': 8, 'stroke-linecap': 'round', pathLength: 1, opacity: 0.9 }, parent);
  const plane = S('path', { d: 'M46,0 L-40,-34 L-22,0 L-40,34 Z', fill: '#fff', stroke: NAVY, 'stroke-width': 6, 'stroke-linejoin': 'round' }, parent);
  const at = (p) => [0, 1].map((i) => (1 - p) ** 2 * a[i] + 2 * p * (1 - p) * mid[i] + p * p * b[i]);
  return (t, t0, t1) => {
    const p = cubicOut(prog(t, t0, t1 - t0));
    show(trail, t > t0);
    show(plane, t > t0 && p < 1);
    const [x, y] = at(p);
    const [x2, y2] = at(Math.min(1, p + 0.02));
    plane.setAttribute('transform', `translate(${x} ${y}) rotate(${(Math.atan2(y2 - y, x2 - x) * 180) / Math.PI || -40}) scale(1.5)`);
    trail.setAttribute('stroke-dasharray', `${p} 2`);
  };
}
