// The body of the main character (me): a drawn body that carries my face pictures.
// hero(parent, { face, outfit }) returns { g, pose(p) } with the same pose values as person()
// in story.js, so a film can use either. Same skeleton as person(): origin at the middle of
// the hips, shoulders at (+-94, -276), chin at -328, feet at about +350.
//
// Outfits: 'hoodie' (college, home) and 'shirt' (office: shirt, lanyard with an ID card).
// Hands: pose({ gripL, gripR }) = 'open' | 'fist' | 'point' | 'thumb'.
// Style: a thin dark line, soft shading and a highlight, to sit with the painted face.
const NS = 'http://www.w3.org/2000/svg';
const S = (tag, attrs = {}, parent, text) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
};
let uid = 0;

// style picks how the torso is drawn; forearm: 'skin' gives rolled or short sleeves;
// legs: 'slim' for leggings; shoeStyle: 'flat' for flat shoes; len: the length of a kurta.
export const OUTFITS = {
  hoodie: { style: 'hoodie', main: ['#FF8A50', '#EE5A2B'], mid: '#F86F3A', dark: '#CF4A22', band: '#E25A2C', pants: ['#42559E', '#2C3A74'], cuff: '#6F84CC', shoe: '#FFF6E8', sole: '#E8602F', tee: '#FBF6EC' },
  shirt: { style: 'shirt', main: ['#EAF2FF', '#BFD5F6'], mid: '#D3E3FB', dark: '#A3BEE8', pants: ['#4C546E', '#343A50'], cuff: '#5F6884', shoe: '#8E5A35', sole: '#3D2616', tee: '#FBF6EC' },
  blazer: { style: 'blazer', main: ['#A33A57', '#7E2741'], mid: '#93304C', dark: '#6E2238', inner: '#FFF3E0', pants: ['#454B60', '#2E3346'], cuff: '#454B60', shoe: '#2A2A33', sole: '#121218', shoeStyle: 'flat', tee: '#FFF3E0' },
  kurta: { style: 'kurta', main: ['#8C5ED6', '#6B40B2'], mid: '#7C4FC4', dark: '#5C3596', trim: '#FFD166', dupatta: '#FFC93C', len: 190, legs: 'slim', pants: ['#F4EBDC', '#E0D2BA'], cuff: '#E0D2BA', shoe: '#C98B4F', sole: '#7A4F2A', shoeStyle: 'flat', tee: '#7C4FC4' },
  kurti: { style: 'kurta', main: ['#FF7B98', '#E9567A'], mid: '#F26A8B', dark: '#C9456A', trim: '#FFFFFF', len: 96, pants: ['#5873BE', '#3E5699'], cuff: '#7D94D6', shoe: '#FFFFFF', sole: '#F26A8B', tee: '#F26A8B', forearm: 'skin' },
  tee: { style: 'tee', main: ['#F5BA3A', '#E09E1E'], mid: '#EDAE2E', dark: '#C9881A', print: '#2F5BFF', pants: ['#4E6CB8', '#334D93'], cuff: '#7891D4', shoe: '#FFFFFF', sole: '#2F5BFF', tee: '#EDAE2E', forearm: 'skin' },
  vest: { style: 'vest', main: ['#3A4876', '#283358'], mid: '#DCE8F7', dark: '#1E2742', inner: '#DCE8F7', tie: '#B23A3A', pants: ['#7A5A40', '#5C422E'], cuff: '#7A5A40', shoe: '#5A3A22', sole: '#2A1A10', tee: '#DCE8F7' },
  overshirt: { style: 'overshirt', main: ['#3EAD7C', '#2A8A5E'], mid: '#36A272', dark: '#246F4C', inner: '#F7F6F0', check: '#17543A', pants: ['#4A62A8', '#33478A'], cuff: '#6F86C8', shoe: '#F7F6F0', sole: '#D9452E', tee: '#F7F6F0', forearm: 'skin' },
};

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
// A sleeve part: the outline of two circles joined by their outer tangents.
function capsule(x1, y1, r1, x2, y2, r2) {
  const d = Math.hypot(x2 - x1, y2 - y1) || 1;
  const t = Math.atan2(y2 - y1, x2 - x1);
  const f = Math.acos(Math.max(-1, Math.min(1, (r1 - r2) / d)));
  const p = (x, y, r, a) => `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`;
  return `M${p(x1, y1, r1, t + f)} A${r1},${r1} 0 ${f < Math.PI / 2 ? 1 : 0} 1 ${p(x1, y1, r1, t - f)} L${p(x2, y2, r2, t - f)} A${r2},${r2} 0 ${f < Math.PI / 2 ? 0 : 1} 1 ${p(x2, y2, r2, t + f)} Z`;
}

// Hand shapes. The wrist is at the origin and the fingers point along +x; the thumb is on -y.
const HANDS = {
  open: { skin: ['M-10,-21 C4,-27 22,-28 36,-27 L62,-28 C73,-28 73,-15 62,-14 L67,-13 C79,-12 79,1 67,1 L65,2 C76,3 75,15 64,15 L57,16 C67,18 65,29 54,28 C36,30 8,28 -10,21 Z', 'M6,-22 C6,-42 22,-52 34,-44 C42,-38 38,-27 28,-21 Z'], lines: ['M42,-14 L62,-14', 'M44,1 L66,1', 'M42,15 L60,15'] },
  fist: { skin: ['M-10,-21 C8,-31 40,-30 52,-18 C61,-8 61,10 52,20 C40,30 8,29 -10,21 Z', 'M12,-25 C22,-37 44,-31 43,-18 C40,-10 24,-9 14,-13 Z'], lines: ['M46,-11 Q53,-5 48,2', 'M48,4 Q55,11 48,18'] },
  point: { skin: ['M-10,-21 C8,-31 40,-30 50,-18 C58,-8 58,10 50,20 C40,30 8,29 -10,21 Z', 'M30,-24 L82,-20 C94,-19 94,-3 82,-2 L36,-1 Z', 'M12,2 C24,-6 42,-2 42,10 C40,18 24,20 14,16 Z'], lines: ['M44,6 Q51,12 46,19'] },
  thumb: { skin: ['M8,-16 C2,-50 10,-68 22,-68 C34,-68 38,-50 34,-16 Z', 'M-10,-21 C8,-31 40,-30 52,-18 C61,-8 61,10 52,20 C40,30 8,29 -10,21 Z'], lines: ['M40,-12 Q49,-6 44,1', 'M42,3 Q51,9 44,16', 'M36,16 Q44,22 36,26'] },
};

export function hero(parent, o = {}) {
  const c = { skin: '#F4A968', shade: '#D98A52', outline: '#2A1A12', outfit: 'hoodie', line: 3.4, face: null, ...o };
  if (c.outline === '#1E1410') c.outline = '#2A1A12';
  const k = { ...OUTFITS[c.outfit] ?? OUTFITS.hoodie, ...(o.colours ?? {}) };
  const g = S('g', {}, parent);
  const defs = S('defs', {}, g);
  const ink = { stroke: c.outline, 'stroke-width': c.line, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const thin = { fill: 'none', stroke: c.outline, 'stroke-width': c.line * 0.75, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  const grad = (stops, x2 = 0, y2 = 1) => {
    const id = `hb${++uid}`;
    const e = S('linearGradient', { id, x1: 0, y1: 0, x2, y2 }, defs);
    stops.forEach((col, i) => S('stop', { offset: i / (stops.length - 1), 'stop-color': col }, e));
    return `url(#${id})`;
  };
  const clip = (d) => { const id = `hc${++uid}`; S('path', { d }, S('clipPath', { id }, defs)); return `url(#${id})`; };

  // ---- an arm: sleeve (two tapered parts), cuff, hand ----
  const bare = k.forearm === 'skin';
  const arm = (side) => {
    const a = S('g', {}, g);
    const edge = S('path', { fill: c.outline, stroke: c.outline, 'stroke-width': c.line * 2, 'stroke-linejoin': 'round' }, a);
    const fill = S('path', { fill: k.mid }, a);
    const fore = S('path', { fill: bare ? c.skin : k.mid }, a);
    // rolled or short sleeves end at the elbow in a band
    const hem = S('g', {}, a);
    if (bare) S('rect', { x: -12, y: -31, width: 24, height: 62, rx: 9, fill: k.dark, ...ink }, hem);
    const hand = S('g', {}, a);
    const grips = {};
    for (const name in HANDS) {
      const h = S('g', {}, hand);
      HANDS[name].skin.forEach((d) => S('path', { d, fill: c.skin, ...ink }, h));
      HANDS[name].lines.forEach((d) => S('path', { d, ...thin, opacity: 0.7 }, h));
      grips[name] = h;
    }
    // the cuff is a band across the wrist, with two rib lines
    const cuff = S('g', {}, a);
    S('rect', { x: -9, y: -27, width: 18, height: 54, rx: 7, fill: k.band ?? k.dark, ...ink }, cuff);
    S('path', { d: 'M-2,-20 L-2,20 M4,-20 L4,20', stroke: c.outline, 'stroke-width': 1.6, opacity: 0.3 }, cuff);
    if (bare) cuff.style.display = 'none';
    return { a, edge, fill, fore, hem, hand, grips, cuff, side };
  };
  const back = { L: arm(-1), R: arm(1) };

  // ---- legs and shoes ----
  const legs = S('g', {}, g);
  const shoe = (m) => {
    const s = S('g', { transform: `scale(${m} 1)` }, legs);
    if (k.shoeStyle === 'flat') {
      S('path', { d: 'M14,300 C8,326 6,350 26,352 L76,352 C94,352 96,330 86,300 Z', fill: k.shoe, ...ink }, s);
      S('path', { d: 'M8,344 C8,350 14,352 26,352 L76,352 C90,352 95,348 95,342 Z', fill: k.sole, ...ink }, s);
      return;
    }
    S('path', { d: 'M10,296 C4,324 2,352 22,354 L78,354 C100,354 104,332 94,296 Z', fill: k.shoe, ...ink }, s);
    S('path', { d: 'M5,338 C4,350 10,354 22,354 L78,354 C92,354 99,348 99,336 Z', fill: k.sole, ...ink }, s);
    S('path', { d: 'M30,312 Q52,302 76,312', ...thin, opacity: 0.6 }, s);
  };
  shoe(1);
  shoe(-1);
  const LEGS = k.legs === 'slim'
    ? 'M-92,-34 L92,-34 C88,90 80,200 74,306 L14,306 C12,220 8,130 3,58 L-3,58 C-8,130 -12,220 -14,306 L-74,306 C-80,200 -88,90 -92,-34 Z'
    : 'M-102,-34 L102,-34 C100,90 96,200 90,306 L16,306 C14,220 10,130 3,58 L-3,58 C-10,130 -14,220 -16,306 L-90,306 C-96,200 -100,90 -102,-34 Z';
  S('path', { d: LEGS, fill: grad(k.pants), ...ink }, legs);
  const legShade = S('g', { 'clip-path': clip(LEGS) }, legs);
  S('path', { d: 'M3,58 C10,130 14,220 16,306 L44,306 C40,200 34,110 30,-34 L-30,-34 C-34,110 -40,200 -44,306 L-16,306 C-14,220 -10,130 -3,58 Z', fill: '#000', opacity: 0.1 }, legShade);
  S('rect', { x: -104, y: 282, width: 208, height: 26, fill: k.cuff }, legShade);
  S('path', { d: 'M-92,282 L-14,282 M14,282 L92,282', ...thin, opacity: 0.7 }, legs);
  S('path', { d: LEGS, fill: 'none', ...ink }, legs);

  // ---- hood behind the neck, neck, T-shirt ----
  if (k.style === 'hoodie') S('path', { d: 'M-96,-292 C-112,-342 -70,-378 -34,-372 L34,-372 C70,-378 112,-342 96,-292 Z', fill: k.dark, ...ink }, g);
  S('path', { d: 'M-50,-322 Q0,-250 50,-322 L50,-290 L-50,-290 Z', fill: k.tee, ...ink }, g);
  S('path', { d: 'M-34,-372 L34,-372 C34,-340 38,-322 44,-312 Q0,-282 -44,-312 C-38,-322 -34,-340 -34,-372 Z', fill: grad([c.shade, c.shade, c.skin]), ...ink }, g);

  // ---- torso ----
  const len = k.len ?? 0;
  const TORSO = k.style === 'kurta'
    ? `M-50,-318 C-74,-314 -98,-304 -110,-286 C-120,-236 -116,-140 -112,-40 C-116,${len * 0.3} -122,${len * 0.7} -126,${len} Q0,${len + 16} 126,${len} C122,${len * 0.7} 116,${len * 0.3} 112,-40 C116,-140 120,-236 110,-286 C98,-304 74,-314 50,-318 Q0,-256 -50,-318 Z`
    : 'M-50,-318 C-74,-314 -98,-304 -110,-286 C-120,-236 -114,-136 -108,-28 L-106,8 Q0,24 106,8 L108,-28 C114,-136 120,-236 110,-286 C98,-304 74,-314 50,-318 Q0,-256 -50,-318 Z';
  const torso = S('g', {}, g);
  S('path', { d: TORSO, fill: grad(k.main), ...ink }, torso);
  const lit = S('g', { 'clip-path': clip(TORSO) }, torso);
  S('path', { d: `M46,-330 C84,-210 76,-90 64,30 L64,${len + 40} L140,${len + 40} L140,-330 Z`, fill: '#000', opacity: 0.11 }, lit);
  S('ellipse', { cx: 0, cy: -312, rx: 86, ry: 34, fill: '#000', opacity: 0.16 }, lit);
  S('ellipse', { cx: -74, cy: -250, rx: 17, ry: 52, fill: '#fff', opacity: 0.2, transform: 'rotate(8 -74 -250)' }, lit);
  if (k.style === 'blazer') {
    // a jacket open over a round-neck top, lapels, one button, pocket flaps
    S('path', { d: 'M-46,-314 L-2,-124 L2,-124 L46,-314 Q0,-262 -46,-314 Z', fill: k.inner, ...ink }, torso);
    S('path', { d: 'M-50,-318 L-92,-236 L-56,-226 L-4,-122 L-40,-300 Z', fill: k.dark, ...ink }, torso);
    S('path', { d: 'M50,-318 L92,-236 L56,-226 L4,-122 L40,-300 Z', fill: k.dark, ...ink }, torso);
    S('path', { d: 'M0,-122 L0,14', ...thin, opacity: 0.6 }, torso);
    S('circle', { cx: 0, cy: -92, r: 7, fill: k.dark, ...ink, 'stroke-width': c.line * 0.7 }, torso);
    S('path', { d: 'M-92,-64 L-44,-64 M44,-64 L92,-64', ...thin, opacity: 0.7 }, torso);
  } else if (k.style === 'kurta') {
    // a long tunic: an embroidered neckline and placket, side slits, an optional dupatta
    S('path', { d: 'M-50,-318 Q0,-256 50,-318', fill: 'none', stroke: k.trim, 'stroke-width': 9, 'stroke-dasharray': '2 9', 'stroke-linecap': 'round' }, torso);
    S('path', { d: 'M0,-288 L0,-180', ...thin }, torso);
    for (let y = -270; y <= -190; y += 20) S('circle', { cx: 6, cy: y, r: 3.5, fill: k.trim }, torso);
    S('path', { d: `M-118,${len * 0.45} L-124,${len} M118,${len * 0.45} L124,${len}`, ...thin, opacity: 0.6 }, torso);
    S('path', { d: `M-126,${len - 14} Q0,${len + 2} 126,${len - 14}`, fill: 'none', stroke: k.trim, 'stroke-width': 6, 'stroke-dasharray': '10 8', opacity: 0.9 }, lit);
    if (k.dupatta) {
      S('path', { d: 'M-104,-296 C-60,-300 -30,-260 10,-160 C40,-90 80,-30 112,-6 L112,40 C70,10 30,-60 -6,-130 C-40,-200 -70,-250 -108,-250 Z', fill: k.dupatta, ...ink }, torso);
      S('path', { d: 'M-90,-280 C-50,-270 -24,-230 8,-160', ...thin, opacity: 0.35 }, torso);
    }
  } else if (k.style === 'tee') {
    // a crew neck with a rib, a small print, a plain hem
    S('path', { d: 'M-50,-318 Q0,-256 50,-318', fill: 'none', stroke: c.outline, 'stroke-width': 15, 'stroke-linecap': 'round' }, torso);
    S('path', { d: 'M-50,-318 Q0,-256 50,-318', fill: 'none', stroke: k.dark, 'stroke-width': 15 - c.line * 2, 'stroke-linecap': 'round' }, torso);
    S('path', { d: 'M-8,-210 L-34,-150 L-6,-150 L-20,-96 L34,-170 L4,-170 L22,-210 Z', fill: k.print, ...ink, 'stroke-width': c.line * 0.8 }, torso);
    S('path', { d: 'M-108,-8 Q0,8 108,-8', ...thin, opacity: 0.5 }, torso);
  } else if (k.style === 'vest') {
    // a shirt under a knitted sweater vest, a collar and a tie
    S('path', { d: 'M-50,-318 C-74,-314 -98,-304 -110,-286 C-120,-236 -114,-136 -108,-28 L-106,8 Q0,24 106,8 L108,-28 C114,-136 120,-236 110,-286 C98,-304 74,-314 50,-318 Q0,-256 -50,-318 Z', fill: k.inner, ...ink }, torso);
    if (k.tie) S('path', { d: 'M-10,-294 L10,-294 L16,-276 L22,-150 L0,-128 L-22,-150 L-16,-276 Z', fill: k.tie, ...ink }, torso);
    const VEST = 'M-82,-300 C-102,-260 -104,-150 -104,-28 L-104,8 Q0,24 104,8 L104,-28 C104,-150 102,-260 82,-300 L44,-306 L0,-180 L-44,-306 Z';
    S('path', { d: VEST, fill: grad(k.main), ...ink }, torso);
    const knit = S('g', { 'clip-path': clip(VEST) }, torso);
    for (let x = -96; x <= 96; x += 14) S('path', { d: `M${x},-320 L${x},20`, stroke: '#000', 'stroke-width': 2, opacity: 0.12 }, knit);
    S('path', { d: 'M-44,-306 L0,-180 L44,-306', fill: 'none', stroke: k.dark, 'stroke-width': 10 }, torso);
    S('path', { d: 'M-104,-20 Q0,-4 104,-20', fill: 'none', stroke: k.dark, 'stroke-width': 10 }, torso);
    S('path', { d: 'M-52,-322 L-8,-296 L-40,-266 C-52,-280 -58,-302 -52,-322 Z', fill: '#F7FAFF', ...ink }, torso);
    S('path', { d: 'M52,-322 L8,-296 L40,-266 C52,-280 58,-302 52,-322 Z', fill: '#F7FAFF', ...ink }, torso);
  } else if (k.style === 'overshirt') {
    // an open check shirt over a plain T-shirt
    for (let x = -120; x <= 120; x += 30) S('rect', { x, y: -330, width: 10, height: 360, fill: k.check, opacity: 0.35 }, lit);
    for (let y = -320; y <= 20; y += 30) S('rect', { x: -130, y, width: 260, height: 10, fill: k.check, opacity: 0.35 }, lit);
    S('path', { d: 'M-40,-312 L-34,16 L34,16 L40,-312 Q0,-262 -40,-312 Z', fill: k.inner, ...ink }, torso);
    S('path', { d: 'M-40,-312 Q0,-262 40,-312', fill: 'none', stroke: c.outline, 'stroke-width': 4 }, torso);
    S('path', { d: 'M-54,-322 L-30,-286 L-58,-246 C-66,-272 -66,-300 -54,-322 Z', fill: k.dark, ...ink }, torso);
    S('path', { d: 'M54,-322 L30,-286 L58,-246 C66,-272 66,-300 54,-322 Z', fill: k.dark, ...ink }, torso);
    S('rect', { x: -88, y: -230, width: 40, height: 44, rx: 6, fill: 'none', ...thin, opacity: 0.7 }, torso);
  } else if (k.style === 'hoodie') {
    // hem, pocket, the edge of the hood round the neck, drawstrings
    S('path', { d: 'M-109,-30 Q0,-12 109,-30 L106,8 Q0,24 -106,8 Z', fill: k.dark }, lit);
    for (let x = -96; x <= 96; x += 16) S('path', { d: `M${x},-22 L${x},12`, stroke: c.outline, 'stroke-width': 2, opacity: 0.22 }, lit);
    S('path', { d: 'M-109,-30 Q0,-12 109,-30', ...thin }, torso);
    S('path', { d: 'M-64,-148 Q0,-160 64,-148 C74,-118 82,-90 88,-62 Q0,-50 -88,-62 C-82,-90 -74,-118 -64,-148 Z', fill: k.mid, ...ink }, torso);
    S('path', { d: 'M-64,-148 C-74,-118 -82,-90 -88,-62 L-70,-64 C-66,-90 -60,-116 -52,-146 Z M64,-148 C74,-118 82,-90 88,-62 L70,-64 C66,-90 60,-116 52,-146 Z', fill: '#000', opacity: 0.14 }, torso);
    S('path', { d: 'M-50,-318 Q0,-256 50,-318', fill: 'none', stroke: c.outline, 'stroke-width': 17, 'stroke-linecap': 'round' }, torso);
    S('path', { d: 'M-50,-318 Q0,-256 50,-318', fill: 'none', stroke: k.dark, 'stroke-width': 17 - c.line * 2, 'stroke-linecap': 'round' }, torso);
    for (const [m, len] of [[-1, 64], [1, 76]]) {
      const d = `M${m * 17},-288 C${m * 21},-262 ${m * 19},-244 ${m * 23},${-288 + len}`;
      S('path', { d, fill: 'none', stroke: c.outline, 'stroke-width': 9.5, 'stroke-linecap': 'round' }, torso);
      S('path', { d, fill: 'none', stroke: '#FFF3DF', 'stroke-width': 9.5 - c.line * 1.5, 'stroke-linecap': 'round' }, torso);
      S('rect', { x: m * 23 - 5, y: -288 + len - 2, width: 10, height: 16, rx: 3, fill: k.dark, ...ink, 'stroke-width': c.line * 0.75 }, torso);
    }
  } else {
    // shirt: placket, buttons, collar, a lanyard with an ID card
    S('path', { d: 'M-9,-290 L-9,14 M9,-290 L9,14', ...thin, opacity: 0.55 }, lit);
    for (const y of [-246, -186, -126, -66]) S('circle', { cx: 0, cy: y, r: 5, fill: '#fff', ...ink, 'stroke-width': c.line * 0.7 }, torso);
    S('path', { d: 'M-34,-308 C-26,-250 -12,-200 0,-170 C12,-200 26,-250 34,-308', fill: 'none', stroke: c.outline, 'stroke-width': 11, 'stroke-linecap': 'round' }, torso);
    S('path', { d: 'M-34,-308 C-26,-250 -12,-200 0,-170 C12,-200 26,-250 34,-308', fill: 'none', stroke: '#2F5BFF', 'stroke-width': 11 - c.line * 1.6, 'stroke-linecap': 'round' }, torso);
    S('rect', { x: -30, y: -176, width: 60, height: 80, rx: 9, fill: '#fff', ...ink }, torso);
    S('path', { d: 'M-30,-152 L-30,-167 Q-30,-176 -21,-176 L21,-176 Q30,-176 30,-167 L30,-152 Z', fill: '#2F5BFF' }, torso);
    S('circle', { cx: 0, cy: -134, r: 12, fill: c.skin, ...ink, 'stroke-width': c.line * 0.7 }, torso);
    S('path', { d: 'M-16,-110 L16,-110', ...thin, opacity: 0.5 }, torso);
    S('path', { d: 'M-52,-322 L-6,-294 L-40,-258 C-52,-276 -58,-300 -52,-322 Z', fill: '#F7FAFF', ...ink }, torso);
    S('path', { d: 'M52,-322 L6,-294 L40,-258 C52,-276 58,-300 52,-322 Z', fill: '#F7FAFF', ...ink }, torso);
  }
  S('path', { d: TORSO, fill: 'none', ...ink }, torso);

  // ---- head: one picture per expression, or a drawn head (cast.js) ----
  const hd = S('g', {}, g);
  let setFace = () => {};
  let setHead = null;
  if (c.headFn) setHead = c.headFn(hd, { S, ink, thin, defs, clip, grad, line: c.line, outline: c.outline });
  else if (c.face) {
    const m = c.face.meta;
    const s = 250 / m.faceWidth;
    const pics = Object.fromEntries(m.names.map((n) => [n, S('image', { href: `${c.face.dir}${n}.png`, x: -m.centre * s, y: 112 - m.chin.neutral * s, width: m.size[0] * s, height: m.size[1] * s }, hd)]));
    setFace = (name) => { const pick = pics[name] ? name : 'neutral'; for (const n in pics) pics[n].style.display = n === pick ? '' : 'none'; };
  }
  const front = { L: arm(-1), R: arm(1) };

  const setArm = (which, target, behind, grip) => {
    const side = which === 'L' ? -1 : 1;
    const [ex, ey, hx, hy] = elbow(side * 94, -276, target[0], target[1], 118, 112, side);
    const fl = Math.hypot(hx - ex, hy - ey) || 1;
    const ux = (hx - ex) / fl;
    const uy = (hy - ey) / fl;
    const wx = hx - ux * 36; // the wrist is 36 before the middle of the hand
    const wy = hy - uy * 36;
    for (const [layer, on] of [[back, behind], [front, !behind]]) {
      const a = layer[which];
      a.a.style.display = on ? '' : 'none';
      if (!on) continue;
      const up = capsule(side * 94, -276, 34, ex, ey, 29);
      const low = capsule(ex, ey, 29, wx, wy, 24.5);
      const turn = (Math.atan2(uy, ux) * 180) / Math.PI;
      a.edge.setAttribute('d', up + low);
      a.fore.setAttribute('d', low);
      a.fill.setAttribute('d', up);
      a.hem.setAttribute('transform', `translate(${ex + ux * 8} ${ey + uy * 8}) rotate(${turn})`);
      a.cuff.setAttribute('transform', `translate(${wx} ${wy}) rotate(${turn})`);
      a.hand.setAttribute('transform', `translate(${wx + ux * 6} ${wy + uy * 6}) rotate(${turn}) scale(1.2 ${-1.2 * side})`);
      for (const n in a.grips) a.grips[n].style.display = n === (a.grips[grip] ? grip : 'open') ? '' : 'none';
    }
  };

  return {
    g,
    pose(p = {}) {
      const q = { x: 0, y: 0, s: 1, flip: false, lean: 0, tilt: 0, hx: 0, hy: 0, face: 'neutral', pop: 1, handL: [-152, -62], handR: [152, -62], gripL: 'open', gripR: 'open', backL: false, backR: false, ...p };
      g.setAttribute('transform', `translate(${q.x} ${q.y}) scale(${q.flip ? -q.s : q.s} ${q.s}) rotate(${q.lean})`);
      // the head turns about the chin; pop (1 = rest) squashes it for a beat when the face changes
      hd.setAttribute('transform', `translate(${q.hx} ${-440 + q.hy}) rotate(${q.tilt} 0 100) translate(0 112) scale(${2 - q.pop} ${q.pop}) translate(0 -112)`);
      if (setHead) setHead(q); else setFace(q.face);
      setArm('L', q.handL, q.backL, q.gripL);
      setArm('R', q.handR, q.backR, q.gripR);
    },
  };
}
