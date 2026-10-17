// Short outros (2 to 3 seconds), Sticker Pop look. One spoken ask; the follow lockup is on screen
// from the first frame, and the mascot acts out each variant's gesture.
// The variant is the id of the only voice line in vo.json (a to g).
import { $, boot, bump, circ, clamp, createKit, ei, eo, lerp, mulberry32, preview, prog, sp } from '/brand/kagaz.js';
import { build } from './timeline.js';

const HANDLE = '@vipulsingh_ai';
const PLATFORMS = 'Instagram  ·  YouTube';

export async function run() {
  const stage = document.getElementById('stage');
  const brand = await boot(stage);
  const vo = await (await fetch('vo.json')).json();
  const { id, dur, T, words, text: spoken, hl } = build(vo);
  const kit = createKit(brand);
  const { stroke, pop, txt, card, sunburst, sticker, mascot, U, PAPER, CARD, INK, RED, BLUE, PINK, YELLOW, MINT, ORANGE } = kit;
  const root = $('g', {}, document.getElementById('world'));

  const text = (parent, x, y, str, a = {}) => {
    const e = $('text', { x, y, 'font-family': '"Baloo 2"', 'font-weight': 800, 'font-size': 80, fill: INK, 'text-anchor': 'middle', ...a }, parent);
    e.textContent = str;
    return e;
  };
  const small = { 'font-family': 'Mukta', 'font-weight': 700, 'font-size': 46, opacity: 0.75 };
  const logoAt = (parent, size) => {
    const g = $('g', {}, parent);
    $('image', { href: '/logo.png', x: -size / 2, y: -size / 2, width: size, height: size }, g);
    return g;
  };
  const press = (t) => Math.max(0, bump(t - T.press - 0.05)); // everything reacts to the button press
  const hop = (t) => 18 * press(t);
  const decor = (list) => list.forEach(([kind, x, y, size, color]) => sticker(root, kind, x, y, size, color));

  function handleCard(parent, cx, cy, rot, w = 760, h = 196) {
    const c = card(parent, cx, cy, w, h, rot, T.user);
    text(c, 0, -2, HANDLE, { 'font-size': 84 });
    text(c, 0, 60, PLATFORMS, small);
    return c;
  }

  // Follow button: pink, drops in, is pressed at T.press and turns into a mint "Following".
  function button(parent, cx, cy, o = {}) {
    const { w = 560, drop = true, ticks = 'below', rot = -2 } = o;
    const btn = $('g', {}, parent);
    $('rect', { x: -w / 2 + 12, y: -48, width: w, height: 124, rx: 62, fill: INK }, btn);
    const face = $('g', {}, btn);
    const body = $('rect', { x: -w / 2, y: -62, width: w, height: 124, rx: 62, stroke: INK, 'stroke-width': 8 }, face);
    const label = text(face, 0, 26, '', { 'font-size': 76 });
    stroke(face, [[150, 0], [176, 28], [226, -34]], { t: T.press + 0.1, d: 0.16, w: 18, color: RED, amp: 2 });
    U.push((t) => {
      const x = t - T.btn;
      btn.style.display = drop && x < 0 ? 'none' : '';
      const e = drop ? eo(clamp(x / 0.3)) : 1;
      const down = Math.exp(-(((t - T.press - 0.05) / 0.07) ** 2));
      const done = t >= T.press + 0.06;
      const b = bump(t - T.press - 0.1);
      body.setAttribute('fill', done ? MINT : PINK);
      label.setAttribute('fill', done ? INK : PAPER);
      label.setAttribute('x', done ? -40 : 0);
      label.textContent = done ? 'Following' : 'Follow करो';
      face.setAttribute('transform', `translate(${12 * down} ${14 * down})`);
      btn.setAttribute('transform', `translate(${cx} ${cy + (1 - e) * 320}) rotate(${rot + (1 - e) * 10}) scale(${1 + (drop ? 0.06 * bump(x - 0.3) : 0) + 0.12 * b} ${1 + (drop ? 0.06 * bump(x - 0.3) : 0) - 0.1 * b})`);
    });
    if (ticks) {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + 0.26;
        if (ticks === 'below' && Math.sin(a) < -0.4) continue;
        if (ticks === 'sides' && Math.abs(Math.sin(a)) > 0.5) continue;
        stroke(parent, [[cx + Math.cos(a) * (w / 2 + 50), cy + Math.sin(a) * 112], [cx + Math.cos(a) * (w / 2 + 100), cy + Math.sin(a) * 148]], { t: T.press + 0.05, d: 0.14, w: 14, color: ORANGE, amp: 2, out: T.press + 0.5 });
      }
    }
    return btn;
  }

  // A rubber stamp: hits hard and settles.
  function stamp(parent, x, y, rot, str, t, o = {}) {
    const { filled = false, ink = false, color = RED, w = 330, size = 70 } = o;
    const col = ink ? INK : color;
    const g = $('g', {}, parent);
    $('rect', { x: -w / 2, y: -56, width: w, height: 112, rx: 12, fill: filled ? col : CARD, stroke: filled ? INK : col, 'stroke-width': 10 }, g);
    text(g, 0, 28, str, { 'font-size': size, fill: filled ? PAPER : col });
    U.push((time) => {
      const q = time - t;
      const k = q < 0 ? 0 : lerp(2.6, 1, eo(clamp(q / 0.12))) * (1 + 0.06 * bump(q - 0.12));
      g.style.display = k <= 0.002 ? 'none' : '';
      g.setAttribute('transform', `translate(${x} ${y}) rotate(${rot}) scale(${k})`);
    });
    return g;
  }
  // A speech bubble sticker; tail on the left (dir 1) or right (dir -1).
  function bubble(parent, x, y, w, h, fill, t, dir = 1, rot = 3) {
    const b = pop(parent, x, y, { t, rot });
    const s = $('g', { transform: `scale(${dir} 1)` }, b);
    const tail = `M${-w / 2 + 90} ${h / 2 - 8} L${-w / 2 + 8} ${h / 2 + 84} L${-w / 2 + 180} ${h / 2 - 8}Z`;
    $('path', { d: tail, fill: INK, transform: 'translate(12 14)' }, s);
    $('rect', { x: -w / 2 + 12, y: -h / 2 + 14, width: w, height: h, rx: 40, fill: INK }, s);
    $('path', { d: tail, fill, stroke: INK, 'stroke-width': 10, 'stroke-linejoin': 'round' }, s);
    $('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 40, fill, stroke: INK, 'stroke-width': 10 }, s);
    $('rect', { x: -w / 2 + 98, y: h / 2 - 14, width: 74, height: 14, fill }, s);
    return b;
  }

  // ---------- pieces for the share outros ----------
  const MUK = { 'font-family': 'Mukta', 'font-weight': 700 };
  // a small yellow video card with a pink play button
  function videoCard(parent) {
    const g = $('g', {}, parent);
    const c = card(g, 0, 0, 200, 300, 0, null, { rx: 20, sw: 8, shadow: [12, 14], fill: YELLOW });
    $('path', { d: 'M-26 -40 L40 0 L-26 40Z', fill: PINK, stroke: INK, 'stroke-width': 7, 'stroke-linejoin': 'round' }, c);
    return g;
  }
  // The video card waits at `from`, then flies to `to` in an arc on T.hit. Returns the landing time.
  function sendCard(parent, from, to, o = {}) {
    const { s0 = 0.62, s1 = 0.45, lift = 200, spin = 360, keep = true } = o;
    const g = videoCard(parent);
    const d = 0.42;
    U.push((t) => {
      const drop = eo(clamp((t + 0.25) / 0.3));
      const p = prog(t, T.hit, d);
      const e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
      g.style.display = !keep && p >= 1 ? 'none' : '';
      const x = lerp(from[0], to[0], e);
      const y = lerp(from[1], to[1], e) - Math.sin(Math.PI * e) * lift - (1 - drop) * 500;
      const b = bump(t - T.hit - d);
      const k = lerp(s0, s1, e);
      g.setAttribute('transform', `translate(${x} ${y}) rotate(${-8 + (1 - drop) * -30 + e * spin + Math.sin(t * 2.2) * 2 * (1 - e)}) scale(${k * (1 + 0.12 * b)} ${k * (1 - 0.12 * b)})`);
    });
    return T.hit + d;
  }
  // The video card at P[0] folds into a paper plane on T.hit and flies along the curve P.
  function paperPlane(P, s0 = 0.62) {
    const B = (e) => {
      const m = 1 - e;
      const c = [m * m * m, 3 * m * m * e, 3 * m * e * e, e * e * e];
      return [0, 1].map((i) => c[0] * P[0][i] + c[1] * P[1][i] + c[2] * P[2][i] + c[3] * P[3][i]);
    };
    const land = T.hit + 0.45;
    const flight = (t) => { const p = prog(t, T.hit, 0.45); return p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2; };
    const vid = videoCard(root);
    U.push((t) => {
      const f = ei(prog(t, T.hit - 0.06, 0.16));
      vid.style.display = f >= 1 ? 'none' : '';
      const e = eo(clamp((t + 0.2) / 0.3));
      vid.setAttribute('transform', `translate(${P[0][0]} ${P[0][1] - (1 - e) * 500}) rotate(${-7 + (1 - e) * -30 + f * 50 + Math.sin(t * 2.2) * 1.5}) scale(${s0 * (1 - f)})`);
    });
    for (let i = 0; i < 14; i++) {
      const a = 0.06 + i / 15;
      const g = $('g', {}, root);
      stroke(g, [B(a), B(a + 0.03)], { t: -1, w: 10, amp: 1, step: 200 });
      U.push((t) => { g.style.display = flight(t) > a + 0.07 ? '' : 'none'; });
    }
    const plane = $('g', {}, root);
    $('path', { d: 'M70 0 L-58 -44 L-34 0 L-58 44Z', fill: CARD, stroke: INK, 'stroke-width': 7, 'stroke-linejoin': 'round' }, plane);
    $('path', { d: 'M70 0 L-34 0 M-34 0 L-46 30', fill: 'none', stroke: INK, 'stroke-width': 6, 'stroke-linecap': 'round' }, plane);
    U.push((t) => {
      const s = sp(t - T.hit + 0.02);
      plane.style.display = s <= 0.002 ? 'none' : '';
      const e = flight(t);
      const [x, y] = B(e);
      const [x2, y2] = B(Math.min(1, e + 0.01));
      const [x1, y1] = B(Math.max(0, e - 0.01));
      const ang = e <= 0 ? -70 : (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
      const rest = clamp((t - land) * 6);
      plane.setAttribute('transform', `translate(${x} ${y + Math.sin(t * 3) * 4 * rest}) rotate(${lerp(ang, -12, rest)}) scale(${2 * s})`);
    });
    return { B, flight, land };
  }
  // a sticker face: a flat or confused mouth, then a smile and a hop from `happyAt`
  function face(parent, x, y, r, hair, o = {}) {
    const { t = -1, happyAt = Infinity, confused = false } = o;
    const g = pop(parent, x, y, { t });
    const k = r / 150;
    const sw = 11 / Math.sqrt(k);
    const s = $('g', {}, g);
    $('circle', { cx: 10, cy: 12, r: 150, fill: INK }, s);
    $('circle', { r: 150, fill: CARD, stroke: INK, 'stroke-width': sw }, s);
    $('path', { d: 'M-150 -20 C-150 -190 150 -190 150 -20 C100 -70 60 -30 20 -80 C-30 -30 -90 -70 -150 -20Z', fill: hair, stroke: INK, 'stroke-width': sw, 'stroke-linejoin': 'round' }, s);
    $('circle', { cx: -52, cy: 20, r: 16, fill: INK }, s);
    $('circle', { cx: 52, cy: 20, r: 16, fill: INK }, s);
    $('circle', { cx: -92, cy: 62, r: 22, fill: PINK, opacity: 0.7 }, s);
    $('circle', { cx: 92, cy: 62, r: 22, fill: PINK, opacity: 0.7 }, s);
    const line = { fill: 'none', stroke: INK, 'stroke-width': sw, 'stroke-linecap': 'round' };
    const before = $('path', { d: confused ? 'M-46 88 q23 -22 46 0 t46 0' : 'M-38 84 H38', ...line }, s);
    const after = $('path', { d: 'M-48 70 Q0 112 48 70', ...line }, s);
    U.push((time) => {
      const h = time >= happyAt;
      before.style.display = h ? 'none' : '';
      after.style.display = h ? '' : 'none';
      s.setAttribute('transform', `translate(0 ${-26 * Math.max(0, bump(time - happyAt))}) scale(${k})`);
    });
    return g;
  }
  const heart = (parent, x, y, s, t) => {
    const g = pop(parent, x, y, { t });
    $('path', { d: 'M0 34 C-70 -18 -34 -78 0 -38 C34 -78 70 -18 0 34Z', fill: PINK, stroke: INK, 'stroke-width': 8 / s, 'stroke-linejoin': 'round', transform: `scale(${s})` }, g);
    return g;
  };
  const redTick = (parent, x, y, s, t) => stroke(parent, [[x - 30 * s, y], [x - 6 * s, y + 26 * s], [x + 38 * s, y - 32 * s]], { t, d: 0.14, w: 16, color: RED, amp: 2 });
  // the logo card and the Follow button that close every share outro
  function lockup() {
    const k = card(root, 540, 1120, 940, 330, 2, T.user);
    const logo = logoAt(k, 264);
    U.push((t) => logo.setAttribute('transform', `translate(-312 ${-hop(t)}) rotate(${-3 + Math.sin(t * 1.8) * 1.5})`));
    text(k, -160, 4, HANDLE, { 'font-size': 76, 'text-anchor': 'start' });
    text(k, -156, 68, PLATFORMS, { ...small, 'text-anchor': 'start' });
    button(root, 540, 1420);
  }
  const COMPOSE = {
    // A: the mascot stands next to the logo and says the comment for you.
    a() {
      sunburst(root, 300, 850);
      decor([['circle', 1040, 1575, 110, MINT], ['plus', 70, 1160, 30, ORANGE]]);
      stroke(root, circ(300, 850, 240, 40, -1.6), { t: 0.1, d: 0.45, color: RED, w: 22, smooth: true, amp: 6 });
      const logo = logoAt(root, 440);
      U.push((t) => {
        const x = t - T.logo;
        logo.setAttribute('transform', `translate(300 ${850 - hop(t)}) rotate(${lerp(-34, -3, eo(clamp(x / 0.32))) + Math.sin(t * 1.8) * 1.4}) scale(${sp(x)})`);
      });
      const b = bubble(root, 620, 580, 230, 150, PINK, T.hit, -1, -5);
      const dots = [-52, 0, 52].map((x) => $('circle', { cx: x, cy: 0, r: 17, fill: PAPER }, b));
      U.push((t) => dots.forEach((d, i) => d.setAttribute('cy', -Math.max(0, Math.sin((t - T.hit) * 14 - i * 1.1)) * 14)));
      mascot(root, 840, 1150, 0.5, {
        t: -0.2,
        pose: (t) => ({ look: t < T.hit ? [300, 850] : [540, 1446], mouth: 0.3 + 0.7 * clamp((t - T.hit) * 8) * clamp((T.press - t) * 4 + 0.3), wave: t < T.hit ? 1 : 0, hop: 70 * press(t) }),
      });
      handleCard(root, 540, 1262, 2, 760, 200);
      button(root, 540, 1446);
    },

    // B: a pinned note swings like a pendulum; the mascot's eyes peek over it.
    b() {
      sunburst(root, 540, 1010);
      decor([['circle', 40, 1560, 100, MINT], ['plus', 985, 590, 30, ORANGE]]);
      const PIN = [540, 600];
      const N = $('g', {}, root);
      const BY = 706;
      mascot(N, -215, 360, 0.42, { pose: (t) => ({ look: [0, BY], hop: 50 * press(t) }) });
      card(N, 0, 392, 800, 824, 0);
      const logo = logoAt(N, 410);
      U.push((t) => logo.setAttribute('transform', `translate(0 ${250 - hop(t)}) rotate(${Math.sin(t * 1.8) * 1.5})`));
      text(N, 0, 540, HANDLE, { 'font-size': 82 });
      text(N, 0, 600, PLATFORMS, small);
      button(N, 0, BY, { w: 520, drop: false, ticks: false, rot: -1.5 });
      const loop = Array.from({ length: 34 }, (_, i) => {
        const a = -2.6 + (i / 33) * Math.PI * 2.5;
        const grow = 1 + (i / 33) * 0.07;
        return [6 + Math.cos(a) * 322 * grow, BY + 6 + Math.sin(a) * 96 * grow];
      });
      stroke(N, loop, { t: T.hit, d: 0.36, w: 13, color: RED, smooth: true, amp: 3 });
      [[-338, -70, -384, -104], [-362, -22, -416, -30], [344, -78, 388, -114]].forEach(([x0, y0, x1, y1], i) =>
        stroke(N, [[x0, BY + y0], [x1, BY + y1]], { t: T.hit + 0.3 + i * 0.04, d: 0.1, w: 12, color: ORANGE, amp: 2 }));
      U.push((t) => {
        const x = t - T.note;
        const e = eo(clamp(x / 0.32));
        const swing = 15 * Math.exp(-2.3 * x) * Math.cos(7.5 * x) + 2.5 * bump(t - T.press - 0.05);
        N.setAttribute('transform', `translate(${PIN[0]} ${PIN[1] - (1 - e) * 1500}) rotate(${swing})`);
      });
      const pin = pop(root, PIN[0], PIN[1], { t: 0.04 });
      $('circle', { cx: 5, cy: 7, r: 32, fill: INK }, pin);
      $('circle', { r: 32, fill: RED, stroke: INK, 'stroke-width': 8 }, pin);
      $('circle', { cx: -10, cy: -10, r: 8, fill: PAPER }, pin);
    },

    // C: your doubt is the next video. The mascot is confused on the card until you comment.
    c() {
      sunburst(root, 540, 870);
      decor([['circle', 1040, 1560, 100, MINT], ['plus', 60, 1180, 30, ORANGE]]);
      const v = card(root, 540, 870, 860, 520, -2, -0.16);
      text(v, -372, -172, 'NEXT VIDEO', { 'font-family': 'Mukta', 'font-weight': 700, 'font-size': 44, 'letter-spacing': '0.14em', 'text-anchor': 'start' });
      text(v, -372, -36, 'तुम्हारा', { 'font-size': 116, 'text-anchor': 'start' });
      text(v, -372, 84, 'doubt', { 'font-size': 116, 'text-anchor': 'start', fill: BLUE });
      stroke(v, [[-368, 112], [-250, 106], [-110, 114]], { t: T.hit, d: 0.22, color: PINK, w: 22, smooth: true, amp: 2 });
      text(v, -372, 196, 'अपनी भाषा में', { 'font-family': 'Mukta', 'font-weight': 700, 'font-size': 56, 'text-anchor': 'start' });
      mascot(v, 250, 236, 0.27, {
        t: -0.1,
        pose: (t) => ({ look: t < T.hit ? [250, -140] : [-200, 600], mouth: t < T.hit ? 0.1 : 0.9, hop: 40 * Math.max(0, bump(t - T.hit)) + 30 * press(t), wave: t >= T.hit ? 1 : 0 }),
      });
      const r = mulberry32(11);
      const knot = Array.from({ length: 22 }, (_, i) => {
        const a = i * 2.4 + r() * 1.2;
        const k = 0.35 + r() * 0.65;
        return [250 + Math.cos(a) * 104 * k, -128 + Math.sin(a) * 60 * k];
      });
      stroke(v, knot, { t: -0.5, d: 0.3, color: RED, w: 11, smooth: true, amp: 3, out: T.hit - 0.05, outD: 0.2 });
      stamp(v, 216, -258, 8, 'comment करो', T.hit + 0.1, { filled: true, color: PINK, w: 430, size: 62 });

      const logo = logoAt(root, 208);
      U.push((t) => {
        const e = eo(clamp((t + 0.12) / 0.3));
        logo.setAttribute('transform', `translate(${lerp(-200, 232, e)} ${1262 - hop(t)}) rotate(${lerp(-120, -3, e) + 4 * bump(t - 0.18)})`);
      });
      txt(root, 362, 1262, HANDLE, { size: 70, anchor: 'start', t: 0.06 });
      txt(root, 366, 1322, PLATFORMS, { size: 44, font: 'Mukta', weight: 700, anchor: 'start', t: 0.14 });
      button(root, 540, 1442);
    },

    // D: the logo rolls in and names topics; the mascot wants to eat every word.
    d() {
      const LX = 330;
      const LY = 935;
      const R = 205;
      sunburst(root, LX, LY);
      decor([['circle', 1040, 1575, 110, MINT], ['plus', 960, 600, 30, ORANGE]]);
      stroke(root, [[50, LY + R + 6], [1030, LY + R + 2]], { t: -0.4, d: 0.3, w: 12, amp: 3 });
      const flips = ['RAG', 'VPN', 'Docker', '?'];
      const flipAt = (t) => clamp(Math.floor((t - T.hit) / T.flip), 0, flips.length - 1);
      mascot(root, 890, LY + R + 4, 0.34, {
        t: -0.1,
        pose: (t) => {
          const since = t - (T.hit + flipAt(t) * T.flip);
          return { look: [600, 668], mouth: 0.25 + 0.75 * Math.exp(-since * 9) * (t > T.hit ? 1 : 0), hop: 60 * press(t) + 16 * Math.max(0, bump(since)) };
        },
      });
      const logo = logoAt(root, R * 2 + 16);
      U.push((t) => {
        const x = lerp(-R - 60, LX, eo(prog(t, -0.2, 0.5)));
        // rolling without slipping: the angle follows the distance travelled
        logo.setAttribute('transform', `translate(${x} ${LY - 18 * Math.max(0, bump(t - 0.3)) - hop(t)}) rotate(${((x - LX) / R) * 57.3 - 3})`);
      });
      const b = bubble(root, 600, 668, 540, 200, CARD, 0.1, 1, 3);
      const word = text(b, 0, 44, '', {});
      U.push((t) => {
        const k = flipAt(t);
        const since = t - (T.hit + k * T.flip);
        const end = k === flips.length - 1;
        word.textContent = flips[k];
        word.setAttribute('fill', end ? PINK : [BLUE, ORANGE, INK][k % 3]);
        word.setAttribute('font-size', end ? 200 : 124);
        word.setAttribute('y', (end ? 72 : 44) - 30 * clamp(1 - since / 0.1));
        word.setAttribute('transform', end ? `rotate(${Math.sin(t * 5) * 5})` : '');
      });
      handleCard(root, 540, 1272, 2);
      button(root, 540, 1448);
    },

    // E: the video folds into a paper plane and flies to the mascot, who is the friend.
    e() {
      sunburst(root, 540, 760);
      decor([['circle', 1040, 1565, 100, MINT], ['plus', 70, 1010, 28, ORANGE]]);
      const P = [[232, 760], [290, 400], [640, 410], [640, 770]];
      const B = (e) => {
        const m = 1 - e;
        const c = [m * m * m, 3 * m * m * e, 3 * m * e * e, e * e * e];
        return [0, 1].map((i) => c[0] * P[0][i] + c[1] * P[1][i] + c[2] * P[2][i] + c[3] * P[3][i]);
      };
      const land = T.hit + 0.45;
      const flight = (t) => { const p = prog(t, T.hit, 0.45); return p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2; };
      mascot(root, 850, 900, 0.3, {
        t: T.friend,
        pose: (t) => ({ look: B(flight(t)), mouth: t < land ? 0.15 : 1, hop: 60 * Math.max(0, bump(t - land)), wave: t >= land ? 1 : 0 }),
      });
      const k = card(root, 540, 1120, 940, 330, 2, T.user);
      const logo = logoAt(k, 264);
      U.push((t) => logo.setAttribute('transform', `translate(-312 ${-hop(t)}) rotate(${-3 + Math.sin(t * 1.8) * 1.5})`));
      text(k, -160, 4, HANDLE, { 'font-size': 76, 'text-anchor': 'start' });
      text(k, -156, 68, PLATFORMS, { ...small, 'text-anchor': 'start' });
      button(root, 540, 1420);
      // the video card that becomes the plane
      const vid = $('g', {}, root);
      const vc = card(vid, 0, 0, 200, 300, 0, null, { rx: 20, sw: 8, shadow: [12, 14], fill: YELLOW });
      $('path', { d: 'M-26 -40 L40 0 L-26 40Z', fill: PINK, stroke: INK, 'stroke-width': 7, 'stroke-linejoin': 'round' }, vc);
      U.push((t) => {
        const f = ei(prog(t, T.hit - 0.06, 0.16));
        vid.style.display = f >= 1 ? 'none' : '';
        const e = eo(clamp((t + 0.2) / 0.3));
        vid.setAttribute('transform', `translate(${P[0][0]} ${P[0][1] - (1 - e) * 500}) rotate(${-7 + (1 - e) * -30 + f * 50 + Math.sin(t * 2.2) * 1.5}) scale(${1 - f})`);
      });
      for (let i = 0; i < 14; i++) {
        const a = 0.06 + i / 15;
        const g = $('g', {}, root);
        stroke(g, [B(a), B(a + 0.03)], { t: -1, w: 10, amp: 1, step: 200 });
        U.push((t) => { g.style.display = flight(t) > a + 0.07 ? '' : 'none'; });
      }
      const plane = $('g', {}, root);
      $('path', { d: 'M70 0 L-58 -44 L-34 0 L-58 44Z', fill: CARD, stroke: INK, 'stroke-width': 7, 'stroke-linejoin': 'round' }, plane);
      $('path', { d: 'M70 0 L-34 0 M-34 0 L-46 30', fill: 'none', stroke: INK, 'stroke-width': 6, 'stroke-linecap': 'round' }, plane);
      U.push((t) => {
        const s = sp(t - T.hit + 0.02);
        plane.style.display = s <= 0.002 ? 'none' : '';
        const e = flight(t);
        const [x, y] = B(e);
        const [x2, y2] = B(Math.min(1, e + 0.01));
        const [x1, y1] = B(Math.max(0, e - 0.01));
        const ang = e <= 0 ? -70 : (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
        const rest = clamp((t - land) * 6);
        plane.setAttribute('transform', `translate(${x} ${y + Math.sin(t * 3) * 4 * rest}) rotate(${lerp(ang, -12, rest)}) scale(${2 * s})`);
      });
    },

    // F: the logo hits like a stamp while the mascot peeks in; "hard" is struck out, "easy" stamped.
    f() {
      const LY = 770;
      sunburst(root, 540, LY);
      decor([['circle', 40, 1010, 80, MINT], ['plus', 90, 620, 30, ORANGE]]);
      const tilt = $('g', { transform: 'rotate(-14 1010 1040)' }, root);
      mascot(tilt, 1010, 1040, 0.42, { t: 0.05, pose: (t) => ({ look: t < T.hit ? [540, LY] : [540, 1262], mouth: 0.5, wave: 1, hop: 50 * press(t) }) });
      stroke(root, circ(540, LY, 216, 36, -1.6), { t: 0.06, d: 0.3, color: RED, w: 22, smooth: true, amp: 6 });
      const logo = logoAt(root, 400);
      U.push((t) => {
        const x = t + 0.08;
        const e = eo(clamp(x / 0.14));
        logo.setAttribute('transform', `translate(540 ${LY - hop(t)}) rotate(${lerp(-18, -4, e) + Math.sin(t * 1.8) * 1.3}) scale(${lerp(2.6, 1, e) * (1 + 0.05 * bump(x - 0.14))})`);
      });
      handleCard(root, 540, 1082, 2, 760, 190);
      button(root, 540, 1262, { ticks: 'sides' });
      stamp(root, 300, 1432, -5, 'मुश्किल', 0.08, { ink: true });
      stroke(root, [[128, 1456], [474, 1404]], { t: T.hit, d: 0.14, w: 22, color: RED, amp: 3 });
      stroke(root, [[506, 1432], [588, 1432]], { t: T.hit + 0.08, d: 0.1, w: 14, amp: 2 });
      stroke(root, [[564, 1408], [592, 1432], [564, 1456]], { t: T.hit + 0.14, d: 0.08, w: 14, amp: 1 });
      stamp(root, 782, 1432, 5, 'आसान', T.hit + 0.16, { filled: true, color: BLUE, w: 290 });
    },

    // G: a taped photo of the logo; the mascot hugs it and the bookmark fills on "save".
    g() {
      sunburst(root, 540, 1060);
      decor([['circle', 40, 1560, 100, MINT], ['plus', 100, 640, 30, ORANGE]]);
      mascot(root, 905, 1335, 0.42, { t: -0.1, pose: (t) => ({ look: [776, 760], mouth: t < T.hit ? 0.2 : 0.9, hop: 50 * Math.max(0, bump(t - T.hit)) + 40 * press(t) }) });
      const ph = card(root, 540, 1060, 600, 560, 3, T.user, { rx: 16 });
      const logo = logoAt(ph, 360);
      U.push((t) => logo.setAttribute('transform', `translate(0 ${-78 - hop(t)}) rotate(${Math.sin(t * 1.8) * 1.5})`));
      text(ph, 0, 176, HANDLE, { 'font-size': 70 });
      text(ph, 0, 234, PLATFORMS, { ...small, 'font-size': 44 });
      const tape = $('g', {}, ph);
      $('rect', { x: -110, y: -28, width: 220, height: 56, fill: MINT, stroke: INK, 'stroke-width': 6 }, tape);
      U.push((t) => {
        const s = sp(t - 0.2);
        tape.style.display = s <= 0.002 ? 'none' : '';
        tape.setAttribute('transform', `translate(-60 -282) rotate(-5) scale(${s} 1)`);
      });
      const mark = $('g', {}, ph);
      const ribbon = $('path', { d: 'M-58 -100 H58 V104 L0 58 L-58 104Z', stroke: INK, 'stroke-width': 10, 'stroke-linejoin': 'round' }, mark);
      U.push((t) => {
        const x = t - T.hit;
        ribbon.setAttribute('fill', x >= 0 ? PINK : CARD);
        mark.setAttribute('transform', `translate(226 -306) scale(${x < 0 ? 1 : lerp(1.9, 1, eo(clamp(x / 0.12))) * (1 + 0.08 * bump(x - 0.12))})`);
      });
      stamp(root, 800, 588, 9, 'SAVED', T.hit + 0.12, { filled: true, color: PINK, w: 300, size: 74 });
      button(root, 540, 1436);
    },
    // H: drop it in the college group. The mascot throws the video into a group chat.
    h() {
      sunburst(root, 640, 760);
      decor([['circle', 1040, 1565, 100, MINT], ['plus', 70, 600, 28, ORANGE]]);
      const w = card(root, 650, 745, 640, 400, 2, -0.2);
      $('rect', { x: -314, y: -194, width: 628, height: 92, rx: 24, fill: MINT }, w);
      $('path', { d: 'M-320 -102 H320', stroke: INK, 'stroke-width': 8 }, w);
      text(w, -286, -130, 'college group', { ...MUK, 'font-size': 52, 'text-anchor': 'start' });
      [[-282, -36, 300, ORANGE, 0.05], [-282, 52, 210, BLUE, 0.3]].forEach(([x, y, wd, col, t0]) => {
        const p = pop(w, x, y, { t: t0 });
        $('circle', { r: 30, fill: col, stroke: INK, 'stroke-width': 7 }, p);
        $('rect', { x: 46, y: -32, width: wd, height: 64, rx: 32, fill: CARD, stroke: INK, 'stroke-width': 7 }, p);
        $('path', { d: `M78 0 H${wd + 14}`, stroke: INK, 'stroke-width': 9, 'stroke-linecap': 'round', opacity: 0.5 }, p);
      });
      mascot(root, 165, 965, 0.32, { t: -0.15, pose: (t) => ({ look: t < T.hit ? [300, 880] : [850, 840], mouth: t < T.hit ? 0.3 : 0.9, wave: t >= T.hit ? 1 : 0, hop: 50 * press(t) }) });
      const land = sendCard(root, [305, 880], [850, 845]);
      heart(root, 985, 720, 0.8, land + 0.04);
      sticker(root, 'star', 720, 900, 44, YELLOW, { t: land + 0.12 });
      redTick(root, 745, 800, 0.9, land + 0.08);
      lockup();
    },

    // I: send it before the exam. An exam calendar shakes; the video flies to two friends.
    i() {
      sunburst(root, 300, 760);
      decor([['circle', 1040, 1565, 100, MINT]]);
      const land = T.hit + 0.42;
      const cal = $('g', {}, root);
      const c = card(cal, 0, 0, 380, 400, 0, null);
      $('rect', { x: -184, y: -194, width: 368, height: 110, rx: 24, fill: PINK }, c);
      $('path', { d: 'M-190 -84 H190', stroke: INK, 'stroke-width': 8 }, c);
      text(c, 0, -112, 'EXAM', { 'font-size': 80, fill: PAPER });
      text(c, 0, 118, 'कल', { 'font-size': 190 });
      [-90, 90].forEach((x) => $('rect', { x: x - 14, y: -232, width: 28, height: 74, rx: 14, fill: INK }, c));
      U.push((t) => {
        const e = eo(clamp((t + 0.25) / 0.3));
        cal.setAttribute('transform', `translate(275 ${750 - (1 - e) * 500}) rotate(${-5 + 6 * Math.sin(t * 34) * Math.exp(-t * 1.8)})`);
      });
      face(root, 800, 655, 84, ORANGE, { t: 0.08, happyAt: land });
      face(root, 905, 850, 74, BLUE, { t: 0.18, happyAt: land + 0.08 });
      mascot(root, 600, 965, 0.26, { t: -0.1, pose: (t) => ({ look: t < land ? [480, 860] : [850, 750], mouth: t < land ? 0.3 : 0.9, hop: 50 * press(t) }) });
      sendCard(root, [485, 870], [752, 812], { s1: 0.4 });
      redTick(root, 700, 600, 1, land + 0.06);
      lockup();
    },

    // J: send it to the one who does not know. The mascot throws a paper plane; "?" becomes "!".
    j() {
      sunburst(root, 800, 770);
      decor([['circle', 1040, 1565, 100, MINT], ['plus', 70, 600, 28, ORANGE]]);
      const land = T.hit + 0.45;
      face(root, 815, 790, 125, MINT, { t: -0.2, confused: true, happyAt: land });
      const q = $('g', {}, root);
      txt(q, 945, 650, '?', { size: 170, color: PINK, t: 0.05, out: land });
      U.push((t) => q.setAttribute('transform', `rotate(${Math.sin(t * 5) * 7} 945 600)`));
      const bang = sticker(root, 'star', 950, 610, 80, YELLOW, { t: land });
      text(bang, 0, 34, '!', { 'font-size': 104 });
      mascot(root, 190, 960, 0.36, { t: -0.2, pose: (t) => ({ look: t < T.hit ? [330, 820] : [815, 790], mouth: t < T.hit ? 0.3 : 0.9, wave: t >= T.hit - 0.1 ? 1 : 0, hop: 50 * press(t) }) });
      paperPlane([[335, 830], [380, 480], [690, 470], [640, 810]]);
      lockup();
    },

    // K: the friend who asks you everything. Question marks pile up in a chat; this video is the reply.
    k() {
      sunburst(root, 580, 760);
      decor([['circle', 1040, 1565, 100, MINT], ['plus', 80, 600, 28, ORANGE]]);
      const land = T.hit + 0.42;
      face(root, 215, 800, 100, PINK, { t: -0.2, confused: true, happyAt: land });
      const ph = card(root, 580, 745, 340, 440, -3, -0.25, { rx: 46 });
      $('rect', { x: -50, y: -200, width: 100, height: 20, rx: 10, fill: INK }, ph);
      [['?', -140, -0.1], ['??', -62, 0.2], ['???', 16, 0.45]].forEach(([str, y, t0], i) => {
        const p = pop(ph, -140, y, { t: t0 });
        const wd = 84 + i * 40;
        $('rect', { x: 0, y: -32, width: wd, height: 64, rx: 32, fill: MINT, stroke: INK, 'stroke-width': 7 }, p);
        text(p, wd / 2, 18, str, { 'font-size': 50 });
      });
      const oh = pop(ph, -140, 172, { t: land + 0.2 });
      $('rect', { x: 0, y: -32, width: 150, height: 64, rx: 32, fill: MINT, stroke: INK, 'stroke-width': 7 }, oh);
      text(oh, 75, 18, 'ओह!', { 'font-size': 46 });
      mascot(root, 905, 965, 0.3, { t: -0.1, pose: (t) => ({ look: t < land ? [580, 745] : [540, 1420], mouth: t < land ? 0.3 : 0.9, hop: 50 * Math.max(0, bump(t - land)) + 40 * press(t) }) });
      sendCard(root, [880, 600], [662, 838], { s0: 0.6, s1: 0.4, lift: 50, spin: 0 });
      redTick(root, 560, 880, 0.7, land + 0.05);
      lockup();
    },

    // L: send it home too. The video flies into a little house, and the house bounces.
    l() {
      sunburst(root, 770, 780);
      decor([['circle', 1040, 1565, 100, MINT], ['plus', 70, 600, 28, ORANGE]]);
      const land = T.hit + 0.42;
      const house = $('g', {}, root);
      $('path', { d: 'M-250 -40 L0 -250 L250 -40 H190 V200 H-190 V-40Z', fill: INK, transform: 'translate(16 18)' }, house);
      $('rect', { x: -190, y: -40, width: 380, height: 240, fill: MINT, stroke: INK, 'stroke-width': 10 }, house);
      $('path', { d: 'M-250 -40 L0 -250 L250 -40Z', fill: ORANGE, stroke: INK, 'stroke-width': 10, 'stroke-linejoin': 'round' }, house);
      $('rect', { x: -52, y: 40, width: 104, height: 160, rx: 12, fill: PINK, stroke: INK, 'stroke-width': 9 }, house);
      $('circle', { cx: 26, cy: 124, r: 9, fill: INK }, house);
      [-122, 122].forEach((x) => {
        $('rect', { x: x - 42, y: 6, width: 84, height: 84, rx: 10, fill: YELLOW, stroke: INK, 'stroke-width': 9 }, house);
        $('path', { d: `M${x} 6 V90 M${x - 42} 48 H${x + 42}`, stroke: INK, 'stroke-width': 7 }, house);
      });
      U.push((t) => {
        const e = sp(t + 0.2) * 0.9;
        const b = bump(t - land);
        house.setAttribute('transform', `translate(775 940) scale(${e * (1 + 0.1 * b)} ${e * (1 - 0.14 * b)}) translate(0 -200)`);
      });
      mascot(root, 200, 960, 0.36, { t: -0.2, pose: (t) => ({ look: t < T.hit ? [340, 850] : [775, 800], mouth: t < T.hit ? 0.3 : 0.9, wave: t >= T.hit ? 1 : 0, hop: 50 * press(t) }) });
      sendCard(root, [345, 850], [775, 868], { s1: 0.2, lift: 250, keep: false });
      heart(root, 915, 575, 1, land + 0.05);
      heart(root, 985, 660, 0.6, land + 0.16);
      lockup();
    },
  };
  COMPOSE[id]();

  kit.captions(document.getElementById('caps'), [{ a: 0, text: spoken, hl, words }], dur);

  window.DUR = dur;
  window.seek = (t) => kit.frame(t);
  window.seek(0);
  window.ready = true;
  if (!new URLSearchParams(location.search).has('render')) preview(stage, window.seek);
}
