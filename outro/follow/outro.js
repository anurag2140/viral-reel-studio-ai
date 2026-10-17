// Follow outros (up to 10 seconds), Sticker Pop look. Goal: turn a viewer into a follower.
// Each one makes a pitch (a hook, then what the series gives you) and then asks for the follow,
// while the logo, the handle, the series line and the Follow button are on screen.
// The variant is the first part of the voice line ids in vo.json:
// journey, series, value, comment, share.
import { $, boot, bump, clamp, createKit, ei, eio, eo, lerp, preview, prog, sp } from '/brand/kagaz.js';
import { build, HL } from './timeline.js';

const HANDLE = '@vipulsingh_ai';
const PLATFORMS = 'Instagram  ·  YouTube';
const SERIES = 'AI  ·  zero से pro  ·  बिना coding'; // the series line, the same in every outro

export async function run() {
  const stage = document.getElementById('stage');
  const brand = await boot(stage);
  const vo = await (await fetch('vo.json')).json();
  const { id, dur, T, P } = build(vo);
  const kit = createKit(brand);
  const { stroke, pop, txt, card, sunburst, sticker, mascot, U, PAPER, CARD, INK, RED, BLUE, PINK, YELLOW, MINT, ORANGE } = kit;
  const root = $('g', {}, document.getElementById('world'));

  const text = (parent, x, y, str, a = {}) => {
    const e = $('text', { x, y, 'font-family': '"Baloo 2"', 'font-weight': 800, 'font-size': 80, fill: INK, 'text-anchor': 'middle', ...a }, parent);
    e.textContent = str;
    return e;
  };
  const MUK = { 'font-family': 'Mukta', 'font-weight': 700 };
  const press = (t) => Math.max(0, bump(t - T.press - 0.05)); // everything reacts to the button press

  sunburst(root, 540, 1000);
  sticker(root, 'circle', 1040, 1590, 96, MINT);
  sticker(root, 'plus', 70, 1490, 28, ORANGE);

  // The hero scene, drawn around (0, 0) in a box of about 1000 x 900.
  // Full size during the pitch, half size above the lockup during the ask.
  const hero = $('g', {}, root);
  U.push((t) => {
    const k = eio(prog(t, T.cta - 0.3, 0.45));
    hero.setAttribute('transform', `translate(540 ${lerp(1010, 752, k)}) scale(${lerp(1, 0.5, k)})`);
  });

  // ---------- shared pieces ----------
  const cross = (g, r, t, w = 34) => {
    stroke(g, [[-r, -r], [r, r]], { t, d: 0.12, w, color: RED, amp: 5 });
    stroke(g, [[r, -r], [-r, r]], { t: t + 0.1, d: 0.12, w, color: RED, amp: 5 });
  };
  const redTick = (parent, x, y, s, t, w = 18) => stroke(parent, [[x - 30 * s, y], [x - 6 * s, y + 26 * s], [x + 38 * s, y - 32 * s]], { t, d: 0.14, w, color: RED, amp: 2 });
  const playIcon = (parent, x, y, r, t) => {
    const g = pop(parent, x, y, { t });
    $('circle', { cx: r * 0.1, cy: r * 0.13, r, fill: INK }, g);
    $('circle', { r, fill: PINK, stroke: INK, 'stroke-width': Math.max(6, r * 0.14) }, g);
    $('path', { d: `M${-r * 0.3} ${-r * 0.46} L${r * 0.52} 0 L${-r * 0.3} ${r * 0.46}Z`, fill: PAPER }, g);
    return g;
  };
  const heart = (parent, x, y, s, t) => {
    const g = pop(parent, x, y, { t });
    $('path', { d: 'M0 34 C-70 -18 -34 -78 0 -38 C34 -78 70 -18 0 34Z', fill: PINK, stroke: INK, 'stroke-width': 8 / s, 'stroke-linejoin': 'round', transform: `scale(${s})` }, g);
    return g;
  };
  // A filled stamp that hits hard and settles.
  function stamp(parent, x, y, rot, str, t, o = {}) {
    const { color = PINK, w = 330, size = 70, out = null } = o;
    const g = $('g', {}, parent);
    $('rect', { x: -w / 2 + 10, y: -46, width: w, height: 112, rx: 14, fill: INK }, g);
    $('rect', { x: -w / 2, y: -56, width: w, height: 112, rx: 14, fill: color, stroke: INK, 'stroke-width': 9 }, g);
    text(g, 0, 28, str, { 'font-size': size, fill: color === YELLOW || color === MINT ? INK : PAPER });
    U.push((time) => {
      const q = time - t;
      let k = q < 0 ? 0 : lerp(2.6, 1, eo(clamp(q / 0.12))) * (1 + 0.06 * bump(q - 0.12));
      if (out != null) k *= 1 - ei(prog(time, out, 0.15));
      g.style.display = k <= 0.002 ? 'none' : '';
      g.setAttribute('transform', `translate(${x} ${y}) rotate(${rot}) scale(${k})`);
    });
    return g;
  }
  // A sticker face: flat or confused mouth, then a smile and a hop from `happyAt`.
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
      s.setAttribute('transform', `translate(0 ${-26 * Math.max(0, bump(time - happyAt)) - 18 * press(time)}) scale(${k})`);
    });
    return g;
  }
  // The video card at Q[0] folds into a paper plane at `tHit` and flies along the curve Q.
  function paperPlane(parent, Q, s0, tHit) {
    const B = (e) => {
      const m = 1 - e;
      const c = [m * m * m, 3 * m * m * e, 3 * m * e * e, e * e * e];
      return [0, 1].map((i) => c[0] * Q[0][i] + c[1] * Q[1][i] + c[2] * Q[2][i] + c[3] * Q[3][i]);
    };
    const land = tHit + 0.45;
    const flight = (t) => { const p = prog(t, tHit, 0.45); return p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2; };
    const vid = $('g', {}, parent);
    const vc = card(vid, 0, 0, 200, 300, 0, null, { rx: 20, sw: 8, shadow: [12, 14], fill: YELLOW });
    $('path', { d: 'M-26 -40 L40 0 L-26 40Z', fill: PINK, stroke: INK, 'stroke-width': 7, 'stroke-linejoin': 'round' }, vc);
    U.push((t) => {
      const f = ei(prog(t, tHit - 0.06, 0.16));
      vid.style.display = f >= 1 ? 'none' : '';
      const e = eo(clamp((t + 0.25) / 0.3));
      vid.setAttribute('transform', `translate(${Q[0][0]} ${Q[0][1] - (1 - e) * 500}) rotate(${-7 + (1 - e) * -30 + f * 50 + Math.sin(t * 2.2) * 1.5}) scale(${s0 * (1 - f)})`);
    });
    for (let i = 0; i < 14; i++) {
      const a = 0.06 + i / 15;
      const g = $('g', {}, parent);
      stroke(g, [B(a), B(a + 0.03)], { t: -1, w: 10, amp: 1, step: 200 });
      U.push((t) => { g.style.display = flight(t) > a + 0.07 ? '' : 'none'; });
    }
    const plane = $('g', {}, parent);
    $('path', { d: 'M70 0 L-58 -44 L-34 0 L-58 44Z', fill: CARD, stroke: INK, 'stroke-width': 7, 'stroke-linejoin': 'round' }, plane);
    $('path', { d: 'M70 0 L-34 0 M-34 0 L-46 30', fill: 'none', stroke: INK, 'stroke-width': 6, 'stroke-linecap': 'round' }, plane);
    U.push((t) => {
      const s = sp(t - tHit + 0.02);
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

  // ---------- the lockup: series line, logo, handle, Follow button ----------
  function lockup() {
    const k = card(root, 540, 1182, 940, 280, 2, T.cta - 0.05);
    const logo = $('g', {}, k);
    $('image', { href: '/logo.png', x: -116, y: -116, width: 232, height: 232 }, logo);
    U.push((t) => logo.setAttribute('transform', `translate(-338 ${-18 * press(t)}) rotate(${-3 + Math.sin(t * 1.8) * 1.5})`));
    text(k, -196, 2, HANDLE, { 'font-size': 76, 'text-anchor': 'start' });
    text(k, -192, 64, PLATFORMS, { ...MUK, 'font-size': 44, 'text-anchor': 'start', opacity: 0.75 });

    // the series line: the reason to follow, in a few words
    const b = $('g', {}, root);
    $('rect', { x: -388, y: -34, width: 800, height: 92, rx: 16, fill: INK }, b);
    $('rect', { x: -400, y: -46, width: 800, height: 92, rx: 16, fill: YELLOW, stroke: INK, 'stroke-width': 8 }, b);
    text(b, 0, 18, SERIES, { ...MUK, 'font-size': 50 });
    U.push((t) => {
      const s = sp(t - T.cta - 0.18);
      b.style.display = s <= 0.002 ? 'none' : '';
      b.setAttribute('transform', `translate(540 1016) rotate(-2) scale(${s * (1 + 0.05 * press(t))})`);
    });

    // Follow button: pink, drops in, is pressed at T.press and turns into a mint "Following"
    const w = 620;
    const cx = 540;
    const cy = 1424;
    const btn = $('g', {}, root);
    $('rect', { x: -w / 2 + 12, y: -48, width: w, height: 124, rx: 62, fill: INK }, btn);
    const face0 = $('g', {}, btn);
    const body = $('rect', { x: -w / 2, y: -62, width: w, height: 124, rx: 62, stroke: INK, 'stroke-width': 8 }, face0);
    const label = text(face0, 0, 26, '', { 'font-size': 76 });
    stroke(face0, [[150, 0], [176, 28], [226, -34]], { t: T.press + 0.1, d: 0.16, w: 18, color: RED, amp: 2 });
    U.push((t) => {
      const x = t - T.btn;
      btn.style.display = x < 0 ? 'none' : '';
      const e = eo(clamp(x / 0.3));
      const down = Math.exp(-(((t - T.press - 0.05) / 0.07) ** 2));
      const done = t >= T.press + 0.06;
      const bb = bump(t - T.press - 0.1);
      // before the press the button pulses, to pull the eye to it
      const pulse = done ? 0 : 0.03 * Math.max(0, Math.sin((t - T.btn) * 9));
      body.setAttribute('fill', done ? MINT : PINK);
      label.setAttribute('fill', done ? INK : PAPER);
      label.setAttribute('x', done ? -40 : 0);
      label.textContent = done ? 'Following' : 'Follow करो';
      face0.setAttribute('transform', `translate(${12 * down} ${14 * down})`);
      btn.setAttribute('transform', `translate(${cx} ${cy + (1 - e) * 320}) rotate(${-2 + (1 - e) * 10}) scale(${1 + 0.06 * bump(x - 0.3) + 0.12 * bb + pulse} ${1 + 0.06 * bump(x - 0.3) - 0.1 * bb + pulse})`);
    });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.26;
      if (Math.sin(a) < -0.4) continue; // keep clear of the card above
      stroke(root, [[cx + Math.cos(a) * (w / 2 + 50), cy + Math.sin(a) * 112], [cx + Math.cos(a) * (w / 2 + 100), cy + Math.sin(a) * 148]], { t: T.press + 0.05, d: 0.14, w: 14, color: ORANGE, amp: 2, out: T.press + 0.5 });
    }
  }

  // ---------- the five pitches ----------
  const V = {
    // 1. Follow for the whole journey: no coding needed, a staircase from ZERO to PRO.
    journey() {
      const N = 5;
      const X0 = -440;
      const SW = 172;
      const top = (i) => 300 - i * 120;
      const cx = (i) => X0 + (i + 0.5) * SW;
      const FILL = [MINT, YELLOW, ORANGE, MINT, YELLOW];
      for (let i = 0; i < N; i++) $('rect', { x: X0 + i * SW + 14, y: top(i) + 16, width: SW, height: 450 - top(i), fill: INK }, hero);
      for (let i = 0; i < N; i++) $('rect', { x: X0 + i * SW, y: top(i), width: SW, height: 450 - top(i), fill: FILL[i], stroke: INK, 'stroke-width': 10 }, hero);
      text(hero, cx(0), 432, 'ZERO', { ...MUK, 'font-size': 46 });
      text(hero, cx(4), top(4) + 160, 'PRO', { 'font-size': 68 });
      // one video on every step
      for (let i = 0; i < N; i++) playIcon(hero, cx(i), top(i) + 58, 30, i === 0 ? -0.3 : T.steps[i - 1] + 0.2);

      // the mascot climbs one step at a time
      const mg = $('g', {}, hero);
      mascot(mg, 0, 0, 0.2, {
        t: -0.3,
        pose: (t) => ({ look: t < T.ok ? [110, -530] : [500, -520], mouth: t < T.ok ? 0.2 : 0.75, wave: t > T.steps[3] + 0.2 ? 1 : 0, hop: 50 * press(t) }),
      });
      U.push((t) => {
        const pos = T.steps.reduce((a, s) => a + eio(prog(t, s, 0.24)), 0);
        const i = Math.min(N - 2, Math.floor(pos));
        const f = pos - i;
        mg.setAttribute('transform', `translate(${lerp(cx(i), cx(i + 1), f)} ${lerp(top(i), top(i + 1), f) - Math.sin(Math.PI * clamp(f)) * 90})`);
      });
      sticker(hero, 'star', 440, -275, 60, PINK, { t: T.steps[3] + 0.25 });

      // "coding नहीं आती?" is crossed out and thrown away
      const code = $('g', {}, hero);
      const cc = card(code, 0, 0, 340, 240, 0);
      text(cc, 0, 28, '</>', { 'font-size': 150 });
      text(cc, 0, 94, 'coding', { ...MUK, 'font-size': 44, opacity: 0.7 });
      cross(cc, 105, T.cross);
      U.push((t) => {
        const e = eo(clamp((t + 0.25) / 0.3));
        const q = ei(prog(t, T.ok, 0.3));
        code.style.display = q >= 1 ? 'none' : '';
        code.setAttribute('transform', `translate(${-240 - 700 * q} ${-240 - 300 * q - (1 - e) * 500}) rotate(${-6 + (1 - e) * -20 - 50 * q})`);
      });
      stamp(hero, -240, -240, -6, 'बिना coding', T.ok + 0.14, { color: PINK, w: 470, size: 74 });
    },

    // 2. Follow for what comes next: three cards are turned over, one per topic.
    series() {
      const X = [-300, 0, 300];
      const ROT = [-5, 0, 5];
      const BACK = [PINK, MINT, ORANGE];
      const TITLES = [['ChatGPT', 'कैसे सोचता है?'], ['Prompt', 'कैसे लिखें?'], ['AI agents', 'क्या हैं?']];
      const done = card(hero, -360, -310, 190, 250, -8, -0.25, { fill: YELLOW, rx: 20, sw: 8, shadow: [12, 14] });
      $('path', { d: 'M-24 -56 L36 -20 L-24 16Z', fill: PINK, stroke: INK, 'stroke-width': 7, 'stroke-linejoin': 'round' }, done);
      text(done, 0, 92, 'ये video', { ...MUK, 'font-size': 36 });
      redTick(done, 52, -70, 1.4, 0.12, 20);
      const rb = pop(hero, 325, -315, { t: T.next, rot: 6 });
      $('rect', { x: -158, y: -44, width: 340, height: 108, rx: 16, fill: INK }, rb);
      $('rect', { x: -170, y: -56, width: 340, height: 108, rx: 16, fill: YELLOW, stroke: INK, 'stroke-width': 8 }, rb);
      text(rb, 0, 22, 'आगे क्या?', { 'font-size': 64 });

      const shown = (t) => T.reveal.filter((r) => t >= r + 0.13).length;
      mascot(hero, 0, 80, 0.42, {
        t: -0.3,
        pose: (t) => {
          const n = shown(t);
          const since = n ? t - T.reveal[n - 1] : 9;
          return { look: n === 0 ? [-360, -310] : [X[n - 1], 110], mouth: 0.3 + 0.6 * Math.exp(-(((since - 0.2) / 0.2) ** 2)), hop: 50 * press(t) };
        },
      });
      X.forEach((x, i) => {
        const g = $('g', {}, hero);
        $('rect', { x: -126, y: -194, width: 280, height: 420, rx: 26, fill: INK }, g);
        const back = $('g', {}, g);
        $('rect', { x: -140, y: -210, width: 280, height: 420, rx: 26, fill: BACK[i], stroke: INK, 'stroke-width': 10 }, back);
        text(back, 0, 82, '?', { 'font-size': 250 });
        const front = $('g', {}, g);
        $('rect', { x: -140, y: -210, width: 280, height: 420, rx: 26, fill: CARD, stroke: INK, 'stroke-width': 10 }, front);
        $('path', { d: 'M-135 -110 V-179 a26 26 0 0 1 26 -26 H109 a26 26 0 0 1 26 26 V-110Z', fill: BACK[i] }, front);
        $('path', { d: 'M-140 -110 H140', stroke: INK, 'stroke-width': 8 }, front);
        text(front, 0, -142, 'आगे', { ...MUK, 'font-size': 46 });
        text(front, 0, -22, TITLES[i][0], { 'font-size': i === 2 ? 50 : 56 });
        text(front, 0, 34, TITLES[i][1], { ...MUK, 'font-size': 40 });
        $('circle', { cx: 4, cy: 131, r: 44, fill: INK }, front);
        $('circle', { cx: 0, cy: 126, r: 44, fill: PINK, stroke: INK, 'stroke-width': 7 }, front);
        $('path', { d: 'M-13 106 L23 126 L-13 146Z', fill: PAPER }, front);
        U.push((t) => {
          const e = eo(clamp((t + 0.3 - i * 0.06) / 0.3));
          const p = prog(t, T.reveal[i], 0.26);
          back.style.display = p < 0.5 ? '' : 'none';
          front.style.display = p < 0.5 ? 'none' : '';
          const b = bump(t - T.reveal[i] - 0.26);
          const w = t > T.wiggle ? Math.sin((t - T.wiggle) * 30 + i) * 5 * Math.exp(-(t - T.wiggle) * 5) : 0;
          g.setAttribute('transform', `translate(${x} ${110 + (1 - e) * 700}) rotate(${ROT[i] + (1 - e) * 20 + w}) scale(${Math.max(0.03, Math.abs(Math.cos(Math.PI * p))) * (1 + 0.08 * b)} ${1 - 0.08 * b})`);
        });
      });
    },

    // 3. Follow for the value: confusing words are cleared away, one thing per video.
    value() {
      const CHIPS = [['LLM', -330, -250], ['token', 300, -285], ['RAG', 365, 20], ['API', -385, 30], ['neural network', -235, 335], ['prompt', 275, 320]];
      face(hero, 0, 60, 140, ORANGE, { t: -0.3, confused: true, happyAt: T.happy });
      const q1 = $('g', {}, hero);
      txt(q1, 185, -95, '?', { size: 170, color: PINK, t: -0.2, out: T.clean, rot: 12 });
      txt(q1, -195, -90, '?', { size: 120, color: RED, t: -0.1, out: T.clean, rot: -14 });
      CHIPS.forEach(([s, bx, by], i) => {
        const g = $('g', {}, hero);
        const w = s.length * 27 + 64;
        $('rect', { x: -w / 2 + 9, y: -34, width: w, height: 88, rx: 44, fill: INK }, g);
        $('rect', { x: -w / 2, y: -44, width: w, height: 88, rx: 44, fill: CARD, stroke: INK, 'stroke-width': 8 }, g);
        text(g, 0, 16, s, { ...MUK, 'font-size': 48 });
        U.push((t) => {
          const q = ei(prog(t, T.clean, 0.3));
          const k = sp(t + 0.3 - i * 0.04) * (1 - q);
          g.style.display = k <= 0.002 ? 'none' : '';
          g.setAttribute('transform', `translate(${bx * (1 + 1.5 * q) + Math.sin(t * 9 + i * 2) * 12} ${by * (1 + 1.5 * q) + Math.cos(t * 8 + i) * 10}) rotate(${Math.sin(t * 7 + i) * 9 + q * 90}) scale(${k * 1.3})`);
        });
      });
      mascot(hero, -385, 250, 0.3, { t: T.clean + 0.05, pose: (t) => ({ look: [0, 60], mouth: 0.8, wave: 1, hop: 50 * press(t) }) });
      const one = card(hero, 0, -300, 800, 184, -2, T.one, { fill: YELLOW });
      text(one, 0, 34, '1 video = 1 चीज़', { 'font-size': 96 });
      stamp(hero, -235, 345, -5, 'बिना coding', T.s1, { color: PINK, w: 440, size: 70 });
      stamp(hero, 240, 345, 4, 'अपनी भाषा', T.s2, { color: BLUE, w: 410, size: 70 });
    },

    // 4. Comment and follow: you choose the next topic, and it becomes the next video.
    comment() {
      const nv = card(hero, 0, -255, 820, 330, -2, -0.25);
      text(nv, -360, -94, 'NEXT VIDEO', { ...MUK, 'font-size': 46, 'letter-spacing': '0.14em', 'text-anchor': 'start' });
      const qg = $('g', {}, nv);
      txt(qg, 0, 124, '?', { size: 280, color: PINK, t: -0.2, out: T.title - 0.2 });
      U.push((t) => qg.setAttribute('transform', `rotate(${Math.sin(t * 5.2) * 6} 0 20)`));
      txt(nv, -70, 76, 'AI agents', { size: 118, t: T.title });
      playIcon(nv, 305, 44, 62, T.title + 0.12);
      stamp(nv, 255, -150, 7, 'तुम चुनो', T.you, { color: PINK, w: 330, size: 68, out: T.title });
      stamp(nv, 235, -150, 7, 'तुम्हारा topic', T.title + 0.2, { color: BLUE, w: 430, size: 62 });

      mascot(hero, -400, 452, 0.27, {
        t: -0.25,
        pose: (t) => ({ look: t < T.box ? [0, -255] : t < T.title ? [0, 140] : [0, -255], mouth: t >= T.title ? 0.9 : 0.3, wave: t >= T.title ? 1 : 0, hop: 40 * Math.max(0, bump(t - T.title)) + 50 * press(t) }),
      });
      const cb = card(hero, 0, 140, 900, 176, 2, T.box);
      face(cb, -366, 0, 54, ORANGE, { t: T.box + 0.1 });
      const typed = text(cb, -282, 26, '', { 'font-size': 68, 'text-anchor': 'start' });
      const caret = $('rect', { y: -40, width: 9, height: 80, rx: 4, fill: RED }, cb);
      const segs = [...new Intl.Segmenter('hi', { granularity: 'grapheme' }).segment('AI agents क्या हैं?')].map((s) => s.segment);
      U.push((t) => {
        const n = Math.round(prog(t, T.type.a, T.type.b - T.type.a) * segs.length);
        typed.textContent = segs.slice(0, n).join('');
        caret.setAttribute('x', -282 + (n ? typed.getComputedTextLength() : 0) + 10);
        caret.style.display = t < T.type.b || Math.sin(t * 22) > 0 ? '' : 'none';
      });
      const send = $('g', {}, pop(cb, 372, 0, { t: T.box + 0.22 }));
      $('circle', { r: 54, fill: PINK, stroke: INK, 'stroke-width': 8 }, send);
      $('path', { d: 'M-22 0 H22 M4 -20 L24 0 L4 20', fill: 'none', stroke: PAPER, 'stroke-width': 12, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, send);
      U.push((t) => send.setAttribute('transform', `scale(${1 + 0.3 * bump(t - T.send)})`));
      [['ChatGPT?', -120, 345, -4, MINT, 0.3], ['Prompt?', 265, 360, 4, YELLOW, 0.42]].forEach(([s, x, y, rot, col, dt]) => {
        const g = pop(hero, x, y, { t: T.title + dt, rot });
        const w = s.length * 30 + 70;
        $('rect', { x: -w / 2 + 9, y: -38, width: w, height: 96, rx: 48, fill: INK }, g);
        $('rect', { x: -w / 2, y: -48, width: w, height: 96, rx: 48, fill: col, stroke: INK, 'stroke-width': 8 }, g);
        text(g, 0, 18, s, { ...MUK, 'font-size': 52 });
      });
    },

    // 5. Share and follow: send it to a friend who wants to learn AI, and learn together.
    share() {
      const tk = mascot(hero, -330, 390, 0.36, {
        t: -0.3,
        pose: (t) => ({ look: t < T.hit ? [-175, 190] : [300, 150], mouth: t < T.hit ? 0.3 : 0.9, wave: t >= T.hit ? 1 : 0, hop: 50 * Math.max(0, bump(t - T.together)) + 50 * press(t) }),
      });
      void tk;
      face(hero, 300, 150, 125, MINT, { t: -0.25, confused: true, happyAt: T.land });
      // what the friend is thinking
      const th = pop(hero, 335, -130, { t: -0.1, out: T.land, rot: 4 });
      $('circle', { cx: -62, cy: 112, r: 16, fill: CARD, stroke: INK, 'stroke-width': 7 }, th);
      $('circle', { cx: -34, cy: 82, r: 24, fill: CARD, stroke: INK, 'stroke-width': 7 }, th);
      $('rect', { x: -118, y: -62, width: 260, height: 136, rx: 62, fill: INK }, th);
      $('rect', { x: -130, y: -74, width: 260, height: 136, rx: 62, fill: CARD, stroke: INK, 'stroke-width': 9 }, th);
      text(th, 0, 26, 'AI?', { 'font-size': 92, fill: PINK });
      const bang = sticker(hero, 'star', 425, -45, 80, YELLOW, { t: T.land });
      text(bang, 0, 34, '!', { 'font-size': 104 });
      paperPlane(hero, [[-175, 190], [-130, -300], [230, -300], [165, 130]], 0.62, T.hit);
      // learn together
      const rb = pop(hero, -20, -330, { t: T.together, rot: -3 });
      $('rect', { x: -288, y: -52, width: 600, height: 132, rx: 18, fill: INK }, rb);
      $('rect', { x: -300, y: -66, width: 600, height: 132, rx: 18, fill: YELLOW, stroke: INK, 'stroke-width': 9 }, rb);
      text(rb, 0, 30, 'साथ सीखो', { 'font-size': 96 });
      heart(hero, -40, 40, 1, T.together + 0.08);
      heart(hero, 40, -40, 0.65, T.together + 0.2);
    },
  };
  V[id]();
  lockup();

  kit.captions(document.getElementById('caps'), P.map((p, i) => ({ a: i === 0 ? 0 : p.a, text: p.text, hl: HL[id][i] || undefined, words: p.words })), dur);

  window.DUR = dur;
  window.seek = (t) => kit.frame(t);
  window.seek(0);
  window.ready = true;
  if (!new URLSearchParams(location.search).has('render')) preview(stage, window.seek);
}
