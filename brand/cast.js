// The supporting cast of the story reels (2026-10-15): five people and two animals; four more
// people on 2026-10-23 (Gupta Ji, Neha, Jassi, Golu).
// People share the body of body.js (same skeleton, hands and pose values as the main
// character) and have drawn heads; pose({ face: 'grin' }) works for them too, and any drawn
// value (eye, brow, smile, open, look, ...) can be set on top of the preset.
//
//   cast(parent, 'priya') -> { g, pose(p) }       people: see CAST below
//   monkey(parent)        -> { g, pose(p) }       Chintu
//   macaw(parent)         -> { g, pose(p) }       Mitthu
//
// Style: a thin dark line, soft shading and a highlight, like the main character's body.
import { hero } from './body.js';

const NS = 'http://www.w3.org/2000/svg';
const S = (tag, attrs = {}, parent, text) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
};
const OUT = '#2A1A12';
let uid = 0;
const show = (e, on) => { e.style.display = on ? '' : 'none'; };

// ---------- the people ----------
export const CAST = {
  priya: {
    name: 'Priya Ma\'am', role: 'boss, manager, interviewer (office)', outfit: 'blazer',
    skin: '#C98B62', shade: '#AE714A',
    head: { hair: '#231616', style: 'bob', lips: '#A8334F', lashes: true, earrings: 'stud' },
  },
  meera: {
    name: 'Meera Aunty', role: 'aunty, mother, neighbour (family)', outfit: 'kurta',
    skin: '#E2A97E', shade: '#C48A60',
    head: { hair: '#2B2124', grey: '#C4BDBA', style: 'bun', lips: '#A33A4E', lashes: true, bindi: true, glasses: 'round', earrings: 'drop' },
  },
  rohan: {
    name: 'Rohan', role: 'friend, colleague, batchmate', outfit: 'overshirt',
    skin: '#A86E48', shade: '#8A5534',
    head: { hair: '#1C181C', style: 'curly', stubble: true },
  },
  ananya: {
    name: 'Ananya', role: 'classmate, friend, junior', outfit: 'kurti',
    skin: '#EDB48C', shade: '#D2946C',
    head: { hair: '#3A2418', style: 'ponytail', lips: '#C2405A', lashes: true, earrings: 'hoop' },
  },
  sharma: {
    name: 'Prof. Sharma', role: 'professor, teacher, father, senior interviewer', outfit: 'vest',
    skin: '#D69C72', shade: '#B87E56',
    head: { hair: '#CFC8C2', style: 'bald', moustache: true, glasses: 'rect' },
  },
  // four more (2026-10-23): a client for the money reels, HR for the career reels, a mentor, a kid
  gupta: {
    name: 'Gupta Ji', role: 'shopkeeper, client, landlord', outfit: 'nehru',
    skin: '#C68A5E', shade: '#A86E44',
    head: { hair: '#1E1614', grey: '#BDB5B0', style: 'side', moustache: 'big', pen: true },
  },
  neha: {
    name: 'Neha', role: 'HR, recruiter, team lead (office)', outfit: 'shirt',
    skin: '#B97A52', shade: '#9C603A',
    colours: { main: ['#E7DDF8', '#C9B8EC'], mid: '#D8CAF2', dark: '#B4A0E0', pants: ['#34343F', '#22222B'], cuff: '#34343F', shoe: '#2A2A33', sole: '#121218', shoeStyle: 'flat' },
    head: { hair: '#1A1216', style: 'long', lips: '#9E3048', lashes: true, earrings: 'stud' },
  },
  jassi: {
    name: 'Jassi', role: 'senior, mentor, freelancer', outfit: 'tee',
    skin: '#D9A07A', shade: '#BC825C',
    colours: { main: ['#2BB3A3', '#1E8E82'], mid: '#26A396', dark: '#1A7A6F', print: '#FFD166', pants: ['#3B3F4A', '#292C35'], cuff: '#4A4F5C', sole: '#FF8A50' },
    head: { hair: '#1C1416', style: 'turban', turban: '#24408E', turbanDark: '#172C66', beard: true, moustache: true },
  },
  golu: {
    // a child: pose him at about 0.8 of the adults' scale
    name: 'Golu', role: 'younger brother, school kid', outfit: 'shirt',
    skin: '#E7AA7E', shade: '#C98C60', headScale: 1.16,
    colours: { main: ['#FFFFFF', '#E4E9F2'], mid: '#F2F5FA', dark: '#C9D2E2', pants: ['#2C3A6E', '#1F2A54'], cuff: '#2C3A6E', shoe: '#1E1E24', sole: '#0E0E12' },
    head: { hair: '#2A1C16', style: 'spiky' },
  },
};

// Expressions by name; a pose may override any value.
export const FACES = {
  neutral: { eye: 1, brow: [0, 0], browY: 0, smile: 0.6, open: 0, mw: 24 },
  grin: { eye: 0.9, brow: [-6, 6], browY: -6, smile: 1.3, open: 0.35, mw: 30 },
  talk: { eye: 1.05, brow: [-3, 3], browY: -4, smile: 0.7, open: 0.4, mw: 24 },
  worried: { eye: 1.3, brow: [-14, 14], browY: -14, smile: -0.6, open: 0.55, mw: 16 },
  sad: { eye: 0.8, brow: [-12, 12], browY: -4, smile: -0.8, open: 0, mw: 22 },
  wink: { eye: 1, eyeR: 0.05, brow: [-6, 10], browY: -6, smile: 1.2, open: 0, mw: 28 },
  thinking: { eye: 1, look: [0.6, -0.7], brow: [-4, 12], browY: -4, smile: 0.1, open: 0, mw: 18 },
  blink: { eye: 0.05, brow: [0, 0], browY: 0, smile: 0.4, open: 0, mw: 22 },
  angry: { eye: 0.95, brow: [16, -16], browY: 6, smile: -0.7, open: 0, mw: 20 },
  amazed: { eye: 1.4, brow: [-10, 10], browY: -18, smile: 0.6, open: 1, mw: 22 },
  smirk: { eye: 0.9, look: [0.4, 0], brow: [0, 10], browY: -2, smile: 0.9, open: 0, mw: 24 },
  'look-left': { eye: 1, look: [-1, 0], smile: 0.6 },
  'look-right': { eye: 1, look: [1, 0], smile: 0.6 },
  yawn: { eye: 0.15, brow: [-8, 8], browY: -8, smile: 0, open: 1.2, mw: 18 },
};

// A drawn head for body.js. The chin is at y 114, the face is 200 wide; ears and hair reach
// about 250, like the main character's face pictures.
function drawnHead(h) {
  return (hd, kit) => {
    const { ink, thin, clip } = kit;
    const hairInk = { ...ink };
    // ---- behind the face ----
    const back = S('g', {}, hd);
    let sway = null;
    if (h.style === 'bob') S('path', { d: 'M-124,72 C-142,-40 -110,-156 0,-162 C110,-156 142,-40 124,72 C112,88 92,88 84,72 L-84,72 C-92,88 -112,88 -124,72 Z', fill: h.hair, ...hairInk }, back);
    if (h.style === 'bun') {
      S('circle', { cx: 0, cy: -150, r: 50, fill: h.hair, ...hairInk }, back);
      S('path', { d: 'M-34,-170 Q0,-186 34,-170 M-40,-148 Q0,-164 40,-148', fill: 'none', stroke: '#fff', 'stroke-width': 4, opacity: 0.18 }, back);
    }
    if (h.style === 'curly') for (const [x, y, r] of [[-104, -36, 32], [-94, -86, 40], [-62, -132, 44], [-12, -152, 46], [42, -144, 44], [86, -106, 40], [104, -50, 32]]) S('circle', { cx: x, cy: y, r, fill: h.hair, ...hairInk }, back);
    if (h.style === 'long') {
      S('path', { d: 'M-122,-20 C-134,-124 -84,-172 0,-172 C84,-172 134,-124 122,-20 Z', fill: h.hair, ...hairInk }, back);
      for (const m of [-1, 1]) S('path', { d: `M${m * 120},-40 C${m * 132},40 ${m * 130},130 ${m * 120},206 C${m * 104},214 ${m * 86},212 ${m * 72},202 C${m * 80},130 ${m * 86},60 ${m * 90},-10 Z`, fill: h.hair, ...hairInk }, back);
    }
    if (h.style === 'ponytail') {
      sway = S('g', {}, back);
      S('path', { d: 'M30,-138 C112,-152 154,-92 144,-12 C138,52 156,104 132,146 C110,104 104,60 108,10 C112,-50 90,-96 30,-110 Z', fill: h.hair, ...hairInk }, sway);
      S('path', { d: 'M118,-60 C130,-10 128,50 132,110', fill: 'none', stroke: '#fff', 'stroke-width': 5, opacity: 0.15, 'stroke-linecap': 'round' }, sway);
      S('ellipse', { cx: 70, cy: -128, rx: 14, ry: 20, fill: '#2F5BFF', ...ink, transform: 'rotate(-30 70 -128)' }, sway);
    }
    // ---- ears ----
    for (const m of [-1, 1]) {
      S('ellipse', { cx: m * 100, cy: 6, rx: 22, ry: 28, fill: kit.skin, ...ink }, hd);
      S('path', { d: `M${m * 102},-6 q${m * 10},10 0,22`, fill: 'none', stroke: kit.shade, 'stroke-width': 5, 'stroke-linecap': 'round' }, hd);
    }
    // ---- the face ----
    const FACE = 'M-100,-24 C-102,-112 -58,-142 0,-142 C58,-142 102,-112 100,-24 C98,52 58,112 0,114 C-58,112 -98,52 -100,-24 Z';
    S('path', { d: FACE, fill: kit.skin, ...ink }, hd);
    const sh = S('g', { 'clip-path': clip(FACE) }, hd);
    S('ellipse', { cx: 84, cy: 0, rx: 46, ry: 160, fill: '#000', opacity: 0.07 }, sh);
    S('ellipse', { cx: -40, cy: -96, rx: 34, ry: 16, fill: '#fff', opacity: 0.2 }, sh);
    if (h.stubble) S('path', { d: 'M-100,0 C-92,80 -50,114 0,116 C50,114 92,80 100,0 C82,52 44,80 0,82 C-44,80 -82,52 -100,0 Z', fill: h.hair, opacity: 0.22 }, sh);
    for (const m of [-1, 1]) S('circle', { cx: m * 58, cy: 40, r: 20, fill: '#FF7A6B', opacity: 0.26 }, hd);
    // ---- eyes ----
    const eye = (x) => {
      const cid = `ce${++uid}`;
      const ce = S('ellipse', { cx: x, cy: -6, rx: 20, ry: 23 }, S('clipPath', { id: cid }, kit.defs));
      const white = S('ellipse', { cx: x, cy: -6, rx: 20, ry: 23, fill: '#fff', ...ink, 'stroke-width': 2.5 }, hd);
      const pg = S('g', { 'clip-path': `url(#${cid})` }, hd);
      const iris = S('circle', { r: 12.5, fill: '#4A2C1E' }, pg);
      const pupil = S('circle', { r: 7, fill: '#1A1014' }, pg);
      const shine = S('circle', { r: 3.6, fill: '#fff' }, pg);
      const shut = S('path', { d: `M${x - 19},-6 q19,13 38,0`, fill: 'none', stroke: OUT, 'stroke-width': 5, 'stroke-linecap': 'round' }, hd);
      const lash = h.lashes ? S('path', { d: x < 0 ? `M${x - 18},-18 l-9,-7` : `M${x + 18},-18 l9,-7`, stroke: OUT, 'stroke-width': 4, 'stroke-linecap': 'round' }, hd) : null;
      return (open, lx, ly) => {
        const closed = open < 0.2;
        white.style.display = pg.style.display = closed ? 'none' : '';
        if (lash) lash.style.display = closed ? 'none' : '';
        shut.style.display = closed ? '' : 'none';
        const ry = 23 * Math.min(open, 1.4);
        ce.setAttribute('ry', ry);
        white.setAttribute('ry', ry);
        const px = x + lx * 7.5;
        const py = -6 + ly * 7;
        for (const e of [iris, pupil]) { e.setAttribute('cx', px); e.setAttribute('cy', py); }
        shine.setAttribute('cx', px + 4);
        shine.setAttribute('cy', py - 4);
      };
    };
    const eyeL = eye(-40);
    const eyeR = eye(40);
    const browD = h.lashes ? 'M-22,4 Q0,-6 22,2' : 'M-22,2 L22,0';
    const browW = h.lashes ? 7 : 10;
    const browC = h.style === 'bald' ? h.hair : (h.hair);
    const browL = S('path', { d: browD, fill: 'none', stroke: browC, 'stroke-width': browW, 'stroke-linecap': 'round' }, hd);
    const browR = S('path', { d: browD, fill: 'none', stroke: browC, 'stroke-width': browW, 'stroke-linecap': 'round', transform: 'scale(-1 1)' }, hd);
    // ---- nose, moustache, mouth ----
    S('path', { d: 'M-6,16 q14,18 -2,28', fill: 'none', stroke: kit.shade, 'stroke-width': 6, 'stroke-linecap': 'round' }, hd);
    // a full beard round the jaw, under the mouth
    if (h.beard) S('path', { d: 'M-102,-10 C-104,70 -60,138 0,142 C60,138 104,70 102,-10 C96,30 84,52 66,58 C50,46 24,40 0,46 C-24,40 -50,46 -66,58 C-84,52 -96,30 -102,-10 Z', fill: h.hair, ...ink, 'stroke-width': 2.5 }, hd);
    const lipC = h.lips ?? '#7A2233';
    const lips = S('path', { fill: 'none', stroke: lipC, 'stroke-width': 7, 'stroke-linecap': 'round' }, hd);
    const gape = S('path', { fill: '#7A2233', stroke: OUT, 'stroke-width': 2.5 }, hd);
    const teeth = S('path', { fill: '#fff' }, hd);
    if (h.moustache === 'big') S('path', { d: 'M-54,52 C-36,30 -10,36 0,44 C10,36 36,30 54,52 C60,62 52,72 42,66 C28,58 10,58 0,56 C-10,58 -28,58 -42,66 C-52,72 -60,62 -54,52 Z', fill: h.hair, ...ink, 'stroke-width': 2.5 }, hd);
    else if (h.moustache) S('path', { d: 'M-40,52 C-24,38 -8,42 0,48 C8,42 24,38 40,52 C28,62 10,58 0,54 C-10,58 -28,62 -40,52 Z', fill: h.hair, ...ink, 'stroke-width': 2.5 }, hd);
    // ---- in front: hair, glasses, bindi, earrings ----
    if (h.style === 'bob') {
      S('path', { d: 'M-104,-28 C-114,-120 -62,-158 4,-156 C72,-154 114,-114 104,-28 C94,-74 68,-102 30,-106 C0,-82 -52,-62 -104,-28 Z', fill: h.hair, ...hairInk }, hd);
      for (const m of [-1, 1]) S('path', { d: `M${m * 104},-40 C${m * 114},10 ${m * 112},52 ${m * 98},80 L${m * 82},80 C${m * 92},42 ${m * 94},0 ${m * 90},-40 Z`, fill: h.hair, ...hairInk }, hd);
      S('path', { d: 'M-60,-140 C-20,-150 30,-146 60,-128', fill: 'none', stroke: '#fff', 'stroke-width': 6, opacity: 0.16, 'stroke-linecap': 'round' }, hd);
    }
    if (h.style === 'bun') {
      S('path', { d: 'M-102,-26 C-116,-118 -48,-158 0,-150 C48,-158 116,-118 102,-26 C94,-78 54,-112 6,-112 L0,-100 L-6,-112 C-54,-112 -94,-78 -102,-26 Z', fill: h.hair, ...hairInk }, hd);
      if (h.grey) S('path', { d: 'M-46,-146 C-76,-130 -96,-90 -100,-44 C-90,-74 -72,-102 -40,-116 Z', fill: h.grey }, hd);
    }
    if (h.style === 'curly') for (const [x, y, r] of [[-70, -100, 30], [-26, -118, 32], [22, -116, 31], [64, -100, 28]]) S('circle', { cx: x, cy: y, r, fill: h.hair, ...hairInk }, hd);
    if (h.style === 'bald') {
      for (const m of [-1, 1]) S('path', { d: `M${m * 102},-44 C${m * 110},-74 ${m * 98},-98 ${m * 80},-98 C${m * 90},-74 ${m * 94},-50 ${m * 96},-12 C${m * 100},-20 ${m * 102},-32 ${m * 102},-44 Z`, fill: h.hair, ...ink, 'stroke-width': 2.5 }, hd);
      S('ellipse', { cx: -34, cy: -116, rx: 28, ry: 10, fill: '#fff', opacity: 0.35, transform: 'rotate(-14 -34 -116)' }, hd);
      S('path', { d: 'M-30,-138 Q-20,-150 -8,-140 M8,-142 Q18,-152 28,-140', fill: 'none', stroke: kit.shade, 'stroke-width': 3, opacity: 0.6 }, hd);
    }
    if (h.style === 'ponytail') S('path', { d: 'M-102,-28 C-112,-120 -50,-160 10,-154 C76,-150 112,-108 102,-28 C96,-86 60,-116 -30,-112 C-60,-96 -86,-64 -102,-28 Z', fill: h.hair, ...hairInk }, hd);
    if (h.style === 'long') {
      S('path', { d: 'M-104,-26 C-114,-120 -56,-158 0,-152 C56,-158 114,-120 104,-26 C98,-84 58,-118 4,-120 L0,-108 L-4,-120 C-58,-118 -98,-84 -104,-26 Z', fill: h.hair, ...hairInk }, hd);
      S('path', { d: 'M-60,-142 C-30,-152 10,-150 40,-140', fill: 'none', stroke: '#fff', 'stroke-width': 6, opacity: 0.16, 'stroke-linecap': 'round' }, hd);
    }
    if (h.style === 'side') {
      S('path', { d: 'M-104,-24 C-112,-118 -60,-158 2,-156 C66,-156 112,-118 104,-24 C98,-70 78,-100 40,-110 C10,-104 -30,-108 -60,-100 C-84,-82 -98,-58 -104,-24 Z', fill: h.hair, ...hairInk }, hd);
      S('path', { d: 'M-42,-150 C-50,-136 -56,-120 -60,-102', fill: 'none', stroke: '#fff', 'stroke-width': 4, opacity: 0.3, 'stroke-linecap': 'round' }, hd);
      if (h.grey) for (const m of [-1, 1]) S('path', { d: `M${m * 104},-26 C${m * 108},-60 ${m * 102},-84 ${m * 90},-98 C${m * 92},-70 ${m * 94},-48 ${m * 96},-14 Z`, fill: h.grey, ...ink, 'stroke-width': 2 }, hd);
    }
    if (h.style === 'spiky') S('path', { d: 'M-104,-26 C-110,-96 -84,-140 -50,-150 L-66,-186 L-22,-160 L-6,-200 L18,-160 L58,-184 L50,-146 C86,-134 110,-100 104,-26 C96,-72 66,-104 22,-108 C-10,-100 -60,-84 -104,-26 Z', fill: h.hair, ...hairInk }, hd);
    if (h.style === 'turban') {
      // a turban with its point over the forehead and folds that run up to it
      const T = 'M-112,-26 C-126,-128 -72,-194 0,-198 C72,-194 126,-128 112,-26 C82,-44 36,-70 0,-98 C-36,-70 -82,-44 -112,-26 Z';
      S('path', { d: T, fill: h.turban, ...ink }, hd);
      const folds = S('g', { 'clip-path': clip(T) }, hd);
      for (const y of [-64, -104, -144]) {
        const d = `M-130,${y + 18} C-80,${y - 16} -36,${y - 40} 0,${y - 52} C36,${y - 40} 80,${y - 16} 130,${y + 18}`;
        S('path', { d, fill: 'none', stroke: h.turbanDark, 'stroke-width': 8, 'stroke-linecap': 'round' }, folds);
        S('path', { d, fill: 'none', stroke: '#fff', 'stroke-width': 4, opacity: 0.2, transform: 'translate(0 9)', 'stroke-linecap': 'round' }, folds);
      }
      S('ellipse', { cx: -50, cy: -160, rx: 34, ry: 12, fill: '#fff', opacity: 0.18, transform: 'rotate(-24 -50 -160)' }, folds);
    }
    // a pen behind the right ear
    if (h.pen) {
      const pen = S('g', { transform: 'translate(108 -34) rotate(-62)' }, hd);
      S('rect', { x: -42, y: -6, width: 84, height: 12, rx: 5, fill: '#2F5BFF', ...ink, 'stroke-width': 2.5 }, pen);
      S('path', { d: 'M42,-6 L58,0 L42,6 Z', fill: '#F4E6C8', ...ink, 'stroke-width': 2 }, pen);
      S('rect', { x: -42, y: -6, width: 16, height: 12, rx: 4, fill: '#1A2E80' }, pen);
    }
    if (h.glasses === 'round') {
      for (const m of [-1, 1]) S('circle', { cx: m * 40, cy: -6, r: 31, fill: '#fff', 'fill-opacity': 0.12, stroke: '#3A2A44', 'stroke-width': 5 }, hd);
      S('path', { d: 'M-10,-10 Q0,-16 10,-10 M-71,-10 L-98,-14 M71,-10 L98,-14', fill: 'none', stroke: '#3A2A44', 'stroke-width': 5 }, hd);
    }
    if (h.glasses === 'rect') {
      for (const m of [-1, 1]) S('rect', { x: m * 40 - 32, y: -30, width: 64, height: 46, rx: 12, fill: '#fff', 'fill-opacity': 0.12, stroke: '#2A2A30', 'stroke-width': 5.5 }, hd);
      S('path', { d: 'M-8,-10 L8,-10 M-72,-12 L-98,-16 M72,-12 L98,-16', fill: 'none', stroke: '#2A2A30', 'stroke-width': 5.5 }, hd);
    }
    if (h.bindi) S('circle', { cx: 0, cy: -46, r: 6.5, fill: '#D62246' }, hd);
    if (h.earrings) for (const m of [-1, 1]) {
      if (h.earrings === 'hoop') S('circle', { cx: m * 104, cy: 44, r: 12, fill: 'none', stroke: '#F2B233', 'stroke-width': 4 }, hd);
      else if (h.earrings === 'drop') { S('circle', { cx: m * 104, cy: 36, r: 5, fill: '#F2B233' }, hd); S('path', { d: `M${m * 104},40 l-7,16 l7,8 l7,-8 Z`, fill: '#F2B233', ...ink, 'stroke-width': 1.5 }, hd); }
      else S('circle', { cx: m * 104, cy: 36, r: 6.5, fill: '#F2B233', ...ink, 'stroke-width': 1.5 }, hd);
    }
    return (p) => {
      const q = { look: [0, 0], ...FACES.neutral, ...(FACES[p.face] ?? {}), ...pick(p) };
      eyeL(q.eyeL ?? q.eye, q.look[0], q.look[1]);
      eyeR(q.eyeR ?? q.eye, q.look[0], q.look[1]);
      browL.setAttribute('transform', `translate(-40 ${-48 + q.browY}) rotate(${q.brow[0]})`);
      browR.setAttribute('transform', `translate(40 ${-48 + q.browY}) rotate(${q.brow[1]}) scale(-1 1)`);
      const w = q.mw;
      const y0 = 70;
      const wide = q.open > 0.05;
      lips.style.display = wide ? 'none' : '';
      gape.style.display = wide ? '' : 'none';
      teeth.style.display = wide && q.smile > 0.8 ? '' : 'none';
      if (wide) {
        gape.setAttribute('d', `M${-w},${y0} Q0,${y0 - 6 * q.open} ${w},${y0} Q${w * 0.92},${y0 + q.open * 34 + q.smile * 10} 0,${y0 + q.open * 40 + q.smile * 12} Q${-w * 0.92},${y0 + q.open * 34 + q.smile * 10} ${-w},${y0} Z`);
        teeth.setAttribute('d', `M${-w * 0.8},${y0 + 1} Q0,${y0 - 4 * q.open + 1} ${w * 0.8},${y0 + 1} L${w * 0.7},${y0 + 10} Q0,${y0 + 14} ${-w * 0.7},${y0 + 10} Z`);
      } else lips.setAttribute('d', `M${-w},${y0 - q.smile * 5} Q0,${y0 + q.smile * 20} ${w},${y0 - q.smile * 5}`);
      if (sway) sway.setAttribute('transform', `rotate(${q.sway ?? 0} 40 -130)`);
    };
  };
}
// the drawn-face values a pose may set directly
const pick = (p) => Object.fromEntries(['eye', 'eyeL', 'eyeR', 'look', 'brow', 'browY', 'smile', 'open', 'mw', 'sway'].filter((k) => p[k] != null).map((k) => [k, p[k]]));

export function cast(parent, name, o = {}) {
  const spec = CAST[name];
  if (!spec) throw new Error(`no cast member "${name}"`);
  const skin = o.skin ?? spec.skin;
  const shade = o.shade ?? spec.shade;
  const head = drawnHead({ ...spec.head, ...(o.head ?? {}) });
  return hero(parent, {
    skin, shade, outfit: o.outfit ?? spec.outfit, colours: o.colours ?? spec.colours, headScale: o.headScale ?? spec.headScale,
    headFn: (hd, kit) => head(hd, { ...kit, skin, shade }),
  });
}

// ---------- Chintu, the monkey ----------
// Origin at the feet. pose({ x, y, s, flip, lean, tilt, face, look, eye, smile, open,
// handL, handR, tail, crouch }): hands are points in the body's own space (shoulders at
// (+-52, -190)); tail is a phase that swings the tail; crouch 0..1 bends the legs.
export function monkey(parent, o = {}) {
  const c = { fur: '#8A5A35', dark: '#6A4226', face: '#F2CFA3', belly: '#E9C08F', ...o };
  const g = S('g', {}, parent);
  const ink = { stroke: OUT, 'stroke-width': 3.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const limb = (w) => [S('path', { fill: 'none', stroke: OUT, 'stroke-width': w + 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g), S('path', { fill: 'none', stroke: c.fur, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g)];
  const tail = limb(20);
  const legs = [limb(30), limb(30)];
  const feet = [-1, 1].map(() => S('ellipse', { rx: 28, ry: 16, fill: c.face, ...ink }, g));
  const BODY = 'M-66,-70 C-80,-160 -50,-214 0,-216 C50,-214 80,-160 66,-70 C58,-36 -58,-36 -66,-70 Z';
  S('path', { d: BODY, fill: c.fur, ...ink }, g);
  S('ellipse', { cx: 0, cy: -110, rx: 42, ry: 58, fill: c.belly }, g);
  S('ellipse', { cx: 34, cy: -150, rx: 12, ry: 40, fill: '#000', opacity: 0.08 }, g);
  const arms = [limb(24), limb(24)];
  const hands = [-1, 1].map(() => S('circle', { r: 18, fill: c.face, ...ink }, g));
  const head = S('g', {}, g);
  for (const m of [-1, 1]) {
    S('circle', { cx: m * 92, cy: -6, r: 38, fill: c.fur, ...ink }, head);
    S('circle', { cx: m * 92, cy: -6, r: 22, fill: c.face }, head);
  }
  S('circle', { cx: 0, cy: 0, r: 96, fill: c.fur, ...ink }, head);
  S('path', { d: 'M-18,-92 L-8,-122 L2,-94 L14,-120 L20,-90 Z', fill: c.dark, ...ink }, head);
  S('path', { d: 'M0,-46 C-28,-86 -86,-70 -80,-14 C-74,42 -40,74 0,76 C40,74 74,42 80,-14 C86,-70 28,-86 0,-46 Z', fill: c.face, ...ink }, head);
  const eyes = [-1, 1].map((m) => {
    const white = S('ellipse', { cx: m * 34, cy: -14, rx: 20, ry: 24, fill: '#fff', ...ink, 'stroke-width': 2.5 }, head);
    const pupil = S('circle', { r: 11, fill: '#1A1014' }, head);
    const shine = S('circle', { r: 3.5, fill: '#fff' }, head);
    const shut = S('path', { d: `M${m * 34 - 18},-14 q18,12 36,0`, fill: 'none', stroke: OUT, 'stroke-width': 5, 'stroke-linecap': 'round' }, head);
    const brow = S('path', { d: 'M-18,0 Q0,-8 18,0', fill: 'none', stroke: c.dark, 'stroke-width': 7, 'stroke-linecap': 'round' }, head);
    return { white, pupil, shine, shut, brow, m };
  });
  for (const m of [-1, 1]) S('ellipse', { cx: m * 9, cy: 22, rx: 4, ry: 6, fill: c.dark }, head);
  const lips = S('path', { fill: 'none', stroke: c.dark, 'stroke-width': 6, 'stroke-linecap': 'round' }, head);
  const gape = S('path', { fill: '#7A2233', ...ink, 'stroke-width': 2.5 }, head);
  const teeth = S('path', { fill: '#fff' }, head);
  for (const m of [-1, 1]) S('circle', { cx: m * 50, cy: 34, r: 14, fill: '#FF7A6B', opacity: 0.3 }, head);
  const MFACES = {
    neutral: { eye: 1, smile: 0.6, open: 0, brow: 0 }, grin: { eye: 0.9, smile: 1.3, open: 0.5, brow: -6 },
    cheeky: { eye: 0.85, smile: 1.1, open: 0, brow: 6, look: [0.6, 0] }, worried: { eye: 1.3, smile: -0.5, open: 0.4, brow: -14 },
    amazed: { eye: 1.4, smile: 0.4, open: 1, brow: -12 }, blink: { eye: 0.05, smile: 0.5, open: 0, brow: 0 },
    angry: { eye: 0.9, smile: -0.6, open: 0, brow: 16 }, talk: { eye: 1, smile: 0.7, open: 0.4, brow: -3 },
  };
  const arm = (which, target) => {
    const m = which ? 1 : -1;
    const sx = m * 52;
    const sy = -188;
    let dx = target[0] - sx;
    let dy = target[1] - sy;
    const d = Math.min(Math.hypot(dx, dy) || 1, 134);
    const ang = Math.atan2(dy, dx);
    const bend = Math.acos(Math.min(1, d / 136)) * m * -1;
    const ex = sx + 68 * Math.cos(ang + bend);
    const ey = sy + 68 * Math.sin(ang + bend);
    const hx = sx + d * Math.cos(ang);
    const hy = sy + d * Math.sin(ang);
    const p = `M${sx},${sy} Q${ex},${ey} ${hx},${hy}`;
    arms[which].forEach((e) => e.setAttribute('d', p));
    hands[which].setAttribute('cx', hx);
    hands[which].setAttribute('cy', hy);
  };
  return {
    g,
    pose(p = {}) {
      const q = { x: 0, y: 0, s: 1, flip: false, lean: 0, tilt: 0, look: [0, 0], ...MFACES.neutral, ...(MFACES[p.face] ?? {}), handL: [-90, -110], handR: [90, -110], tail: 0, crouch: 0.3, ...p };
      g.setAttribute('transform', `translate(${q.x} ${q.y}) scale(${q.flip ? -q.s : q.s} ${q.s}) rotate(${q.lean})`);
      const cr = q.crouch;
      [-1, 1].forEach((m, i) => {
        const kx = m * (60 + 40 * cr);
        const ky = -46 + 20 * cr;
        const d = `M${m * 34},-70 Q${kx},${ky} ${m * 46},-8`;
        legs[i].forEach((e) => e.setAttribute('d', d));
        feet[i].setAttribute('cx', m * 56);
        feet[i].setAttribute('cy', -6);
      });
      const sw = Math.sin(q.tail);
      const td = `M44,-70 C150,-${70 - 10 * sw} ${170 + 20 * sw},-210 ${110 + 30 * sw},-250 C${70 + 20 * sw},-276 ${54 + 10 * sw},-232 ${84 + 16 * sw},-222`;
      tail.forEach((e) => e.setAttribute('d', td));
      arm(0, q.handL);
      arm(1, q.handR);
      head.setAttribute('transform', `translate(0 -290) rotate(${q.tilt})`);
      eyes.forEach((e) => {
        const closed = (e.m < 0 ? q.eyeL ?? q.eye : q.eyeR ?? q.eye) < 0.2;
        const open = Math.min(q.eye, 1.4);
        show(e.white, !closed); show(e.pupil, !closed); show(e.shine, !closed); show(e.shut, closed);
        e.white.setAttribute('ry', 24 * open);
        const px = e.m * 34 + q.look[0] * 8;
        const py = -14 + q.look[1] * 8;
        e.pupil.setAttribute('cx', px); e.pupil.setAttribute('cy', py);
        e.shine.setAttribute('cx', px + 4); e.shine.setAttribute('cy', py - 4);
        e.brow.setAttribute('transform', `translate(${e.m * 34} ${-46 - (open - 1) * 12}) rotate(${e.m * q.brow})`);
      });
      const y0 = 46;
      const w = 30;
      const wide = q.open > 0.05;
      show(lips, !wide); show(gape, wide); show(teeth, wide && q.smile > 0.8);
      if (wide) {
        gape.setAttribute('d', `M${-w},${y0} Q0,${y0 - 4} ${w},${y0} Q${w * 0.9},${y0 + q.open * 30 + q.smile * 8} 0,${y0 + q.open * 34 + q.smile * 10} Q${-w * 0.9},${y0 + q.open * 30 + q.smile * 8} ${-w},${y0} Z`);
        teeth.setAttribute('d', `M${-w * 0.8},${y0 + 1} L${w * 0.8},${y0 + 1} L${w * 0.7},${y0 + 10} L${-w * 0.7},${y0 + 10} Z`);
      } else lips.setAttribute('d', `M${-w},${y0 - q.smile * 5} Q0,${y0 + q.smile * 20} ${w},${y0 - q.smile * 5}`);
    },
  };
}

// ---------- Mitthu, the macaw ----------
// Origin at the feet (on a perch), facing right. pose({ x, y, s, flip, lean, tilt, flap,
// talk, blink, look }): flap 0..1 lifts the wing; talk 0..1 opens the beak.
export function macaw(parent, o = {}) {
  const c = { red: '#E2342C', dark: '#B8211E', yellow: '#FFC824', blue: '#2F6BD8', blueDark: '#1F4FA8', face: '#F8F3EA', beak: '#EFE8DA', jaw: '#2A2626', feet: '#7D7A80', ...o };
  const g = S('g', {}, parent);
  const ink = { stroke: OUT, 'stroke-width': 3.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const feather = (parentG, col, rot, len) => S('path', { d: `M0,0 C-16,${len * 0.25} -12,${len * 0.65} 0,${len} C12,${len * 0.65} 16,${len * 0.25} 0,0 Z`, fill: col, ...ink, transform: `rotate(${rot})` }, parentG);
  const tail = S('g', { transform: 'translate(-28 -60)' }, g);
  feather(tail, c.blue, 34, 240);
  feather(tail, c.red, 22, 270);
  feather(tail, c.red, 10, 230);
  S('path', { d: 'M-4,-12 c-8,10 -14,16 -8,18 M22,-12 c-6,10 -10,16 -4,18', fill: 'none', stroke: c.feet, 'stroke-width': 9, 'stroke-linecap': 'round' }, g);
  const BODY = 'M-52,-40 C-72,-120 -32,-214 30,-218 C90,-220 104,-140 84,-70 C70,-16 12,10 -52,-40 Z';
  S('path', { d: BODY, fill: c.red, ...ink }, g);
  S('ellipse', { cx: 40, cy: -110, rx: 22, ry: 60, fill: '#fff', opacity: 0.14 }, g);
  const wing = S('g', {}, g);
  S('path', { d: 'M20,-176 C-50,-170 -82,-100 -78,-30 C-74,20 -40,40 -10,26 C20,-20 44,-110 20,-176 Z', fill: c.blue, ...ink }, wing);
  for (let k = 0; k < 4; k++) S('path', { d: `M${-70 + k * 16},${-10 + k * 6} L${-60 + k * 16},${30 - k * 4}`, stroke: c.blueDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, wing);
  S('path', { d: 'M20,-176 C-36,-172 -64,-130 -66,-90 C-40,-104 -6,-110 30,-104 C40,-130 36,-160 20,-176 Z', fill: c.yellow, ...ink }, wing);
  S('path', { d: 'M20,-176 C-14,-176 -36,-160 -44,-140 C-20,-148 6,-148 32,-140 C34,-154 30,-168 20,-176 Z', fill: c.red, ...ink }, wing);
  const head = S('g', {}, g);
  S('circle', { cx: 0, cy: 0, r: 64, fill: c.red, ...ink }, head);
  S('path', { d: 'M4,-30 C40,-40 66,-14 62,24 C46,40 14,36 2,16 C-4,0 -6,-20 4,-30 Z', fill: c.face, ...ink, 'stroke-width': 2.5 }, head);
  S('path', { d: 'M14,4 L34,6 M12,18 L30,20 M20,-12 L38,-10', stroke: '#3A3A3A', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, head);
  const eyeRing = S('circle', { cx: 28, cy: -10, r: 12, fill: '#FFF7C2', ...ink, 'stroke-width': 2.5 }, head);
  const pupil = S('circle', { cx: 28, cy: -10, r: 7, fill: '#1A1014' }, head);
  const shine = S('circle', { cx: 31, cy: -13, r: 2.5, fill: '#fff' }, head);
  const lid = S('path', { d: 'M16,-10 q12,8 24,0', fill: 'none', stroke: OUT, 'stroke-width': 4, 'stroke-linecap': 'round' }, head);
  const jaw = S('path', { d: 'M52,14 C72,10 90,26 88,46 C76,42 62,36 50,30 Z', fill: c.jaw, ...ink }, head);
  S('path', { d: 'M46,-22 C100,-40 124,14 98,56 C94,26 82,8 54,12 C46,4 44,-10 46,-22 Z', fill: c.beak, ...ink }, head);
  S('path', { d: 'M70,-24 C88,-20 100,-6 104,10', fill: 'none', stroke: '#C9C0AE', 'stroke-width': 3 }, head);
  return {
    g,
    pose(p = {}) {
      const q = { x: 0, y: 0, s: 1, flip: false, lean: 0, tilt: 0, flap: 0, talk: 0, blink: 0, look: [0, 0], ...p };
      g.setAttribute('transform', `translate(${q.x} ${q.y}) scale(${q.flip ? -q.s : q.s} ${q.s}) rotate(${q.lean})`);
      wing.setAttribute('transform', `rotate(${q.flap * 105} 20 -150) scale(1 ${1 + 0.15 * q.flap})`);
      head.setAttribute('transform', `translate(46 -222) rotate(${q.tilt})`);
      jaw.setAttribute('transform', `rotate(${q.talk * 28} 52 16)`);
      const closed = q.blink > 0.5;
      show(pupil, !closed); show(shine, !closed); show(lid, closed);
      eyeRing.setAttribute('ry', 12);
      pupil.setAttribute('cx', 28 + q.look[0] * 3); pupil.setAttribute('cy', -10 + q.look[1] * 3);
    },
  };
}
