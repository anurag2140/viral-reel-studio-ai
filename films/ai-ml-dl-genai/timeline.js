// Shared by film.html (visuals) and score.mjs (sound): every cue time comes from vo.json.

// Start time of each word, spread over the sentence span by word length.
export function wordTimes(s) {
  const words = s.text.split(' ');
  const w = words.map((x) => x.length + 1);
  const total = w.reduce((a, b) => a + b, 0);
  let acc = 0;
  return words.map((word, i) => {
    const t = s.a + ((s.b - s.a) * acc) / total;
    acc += w[i];
    return { word, t };
  });
}

const wordAt = (s, needle) => (wordTimes(s).find((x) => x.word.includes(needle)) ?? { t: s.a }).t;

export function build(vo) {
  const beat = 60 / vo.bpm;

  // Sentence spans: the longest internal pauses are the sentence breaks.
  const L = {};
  for (const l of vo.lines) {
    const n = l.sentences.length;
    const cuts = [...l.pauses].sort((x, y) => y[1] - y[0] - (x[1] - x[0])).slice(0, n - 1).sort((x, y) => x[0] - y[0]);
    const chars = l.sentences.reduce((a, s) => a + s.length, 0);
    let a = 0;
    let acc = 0;
    const s = l.sentences.map((text, i) => {
      acc += text.length;
      const even = cuts.length !== n - 1;
      const b = i === n - 1 ? l.duration : even ? (l.duration * acc) / chars : cuts[i][0];
      const o = { a: l.start + a, b: l.start + b, text };
      a = i === n - 1 ? b : even ? b : cuts[i][1];
      return o;
    });
    L[l.id] = { start: l.start, end: l.start + l.duration, s };
  }

  const last = vo.lines[vo.lines.length - 1];
  const dur = Math.ceil((last.start + last.duration + 1.5) / (4 * beat)) * 4 * beat;

  const H = L.hook.s;
  const P = L.payoff.s;
  const levels = ['ai', 'ml', 'dl', 'gen'].map((id) => L[id]);

  const T = {
    slam: H.slice(0, 4).map((s) => Math.max(0.12, s.a + 0.03)),
    jolt: wordAt(H[4], 'एक'),
    toOv: { a: L.nest.start - 0.45, b: L.nest.start + 0.25 },
    ringDraw: [0, 1, 2, 3].map((j) => L.nest.start + 0.05 + j * 0.3),
    arrow: wordAt(L.nest.s[0], 'अंदर'),
    morph: { a: L.ai.start - 0.6, b: L.ai.start + 0.2 },
    zoom: levels.map((l) => ({ a: l.start - 0.5, b: l.start + 0.2 })),
    ringRed: levels.map((l) => l.start + 0.25),
    illus: levels.map((l) => l.s[1].a),
    card: levels.map((l) => l.s[2].a - 0.05),
    stamp: levels.map((l) => l.s[2].a + 0.55),
    bulb: wordAt(L.ai.s[1], 'smart'),
    learn: wordAt(L.ml.s[1], 'खुद'),
    layers: wordAt(L.dl.s[1], 'layers'),
    erase: L.payoff.start - 0.7,
    out: { a: L.payoff.start - 0.6, b: L.payoff.start + 0.4 },
    fill: P[1].a,
    pulse: [3, 2, 1, 0].map((j, i) => P[1].a + 0.45 + i * 0.26),
    check: P[1].b - 0.2,
    dot: P[2].a,
    link: P[2].a + 0.55,
    cross: wordAt(P[2], 'नहीं'),
    recap: Math.round((P[2].b + 0.3) / beat) * beat,
  };

  // Sound effects, one entry per visual hit.
  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +t.toFixed(3), type, ...o });
  T.slam.forEach((t, i) => add(t, 'thud', { gain: 1 - i * 0.08 }));
  add(T.jolt, 'swipe');
  add(T.jolt + 0.02, 'thud', { gain: 0.6 });
  add(T.toOv.a, 'whoosh', { dur: 0.7, gain: 0.7 });
  T.ringDraw.forEach((t) => add(t, 'scratch', { dur: 0.45 }));
  add(T.arrow, 'swipe');
  add(T.morph.a, 'whoosh', { dur: 0.8 });
  levels.forEach((l, k) => {
    if (k > 0) add(T.zoom[k].a, 'whoosh', { dur: 0.7 });
    add(T.zoom[k].b - 0.12, 'pop');
    add(T.ringRed[k], 'swipe', { dur: 0.6, gain: 0.7 });
    add(T.illus[k], 'scratch', { dur: k === 2 ? 1.7 : 0.9 });
    add(T.card[k] + 0.3, 'paper');
    add(T.stamp[k], k === 0 ? 'pop' : 'stamp');
  });
  add(T.bulb, 'ding', { gain: 0.5 });
  add(T.learn, 'swipe');
  [0, 1, 2, 3].forEach((i) => add(T.layers + i * 0.09, 'tick'));
  [0, 1, 2].forEach((i) => add(T.illus[3] + 0.15 + i * 0.28, 'pop', { gain: 0.9 }));
  add(T.out.a, 'whoosh', { dur: 1.0 });
  add(T.fill, 'scratch', { dur: 0.6 });
  T.pulse.forEach((t) => add(t, 'tick'));
  add(T.check, 'stamp');
  add(T.dot, 'pop');
  add(T.link, 'scratch', { dur: 0.5 });
  add(T.cross, 'swipe');
  add(T.cross + 0.12, 'swipe');
  add(T.recap, 'ding');

  return { beat, dur, L, T, sfx };
}
