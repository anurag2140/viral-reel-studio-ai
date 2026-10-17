// #03 Neural network = दिमाग़ की copy? Cue times and SFX, all from vo.json.
import { spans, wordAt } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const L = spans(vo);
  const H = L.hook.s;
  const M = L.myth.s;
  const F = L.fact.s[0];
  const C = L.calc.s[0];
  const N = L.layers.s;
  const D = L.diff.s;
  const Z = L.pay.s[0];
  const X = L.maths.s[0];

  const T = {
    // hook: not a copy of the brain. Then what runs ChatGPT?
    cross: wordAt(H[0], 'नहीं'),
    q: H[1].a,
    // the name comes from the neuron, a cell that sends signals
    toMyth: M[0].a - 0.3,
    name: wordAt(M[0], 'neuron'),
    cell: wordAt(M[1], 'cell'),
    signal: wordAt(M[1], 'signal'),
    // in the network a neuron is one small sum
    toFact: F.a - 0.3,
    calc: wordAt(F, 'हिसाब'),
    nums: wordAt(C, 'numbers'),
    mul: wordAt(C, 'गुणा'),
    add: wordAt(C, 'जोड़'),
    // crores of sums, joined in layers
    toNet: N[0].a - 0.3,
    many: wordAt(N[0], 'करोड़ों'),
    netStamp: wordAt(N[1], 'neural'),
    // the brain thinks and feels; the network only changes numbers
    toDiff: D[0].a - 0.3,
    think: wordAt(D[0], 'सोचता'),
    feel: wordAt(D[0], 'महसूस'),
    nums2: wordAt(D[1], 'numbers'),
    // payoff
    toPay: Z.a - 0.28,
    idea: wordAt(Z, 'idea'),
    notBrain: wordAt(Z, 'नहीं'),
    maths: X.a,
  };
  T.recap = Math.ceil(X.a / (beat / 2)) * (beat / 2);
  const dur = X.b + 0.45; // end right after the payoff

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  add(0.05, 'thud');
  add(T.cross, 'swipe');
  add(T.cross + 0.12, 'stamp');
  add(T.q, 'pop');
  add(T.toMyth, 'whoosh', { dur: 0.45, gain: 0.7 });
  add(T.name, 'pop');
  add(T.cell, 'stamp', { gain: 0.8 });
  [0, 1, 2].forEach((i) => add(T.signal + i * 0.22, 'tick', { gain: 1.2 }));
  add(T.toFact, 'whoosh', { dur: 0.45, gain: 0.7 });
  add(T.calc, 'stamp');
  [0, 1, 2].forEach((i) => add(T.nums + i * 0.1, 'paper', { gain: 0.8 }));
  [0, 1, 2].forEach((i) => add(T.mul + i * 0.08, 'pop', { gain: 0.8 }));
  add(T.add, 'thud', { gain: 0.8 });
  add(T.add + 0.3, 'ding', { gain: 0.5 });
  add(T.toNet, 'whoosh', { dur: 0.45, gain: 0.7 });
  for (let i = 0; i < 8; i++) add(T.toNet + 0.3 + i * 0.14, 'tick');
  add(T.many, 'pop');
  add(T.netStamp, 'stamp');
  add(T.toDiff, 'whoosh', { dur: 0.45, gain: 0.7 });
  add(T.think, 'pop');
  add(T.feel, 'pop');
  [0, 1, 2, 3].forEach((i) => add(T.nums2 + i * 0.12, 'tick', { gain: 1.2 }));
  add(T.toPay, 'whoosh', { dur: 0.4, gain: 0.6 });
  add(T.idea, 'swipe', { dur: 0.3 });
  add(T.notBrain, 'swipe');
  add(T.maths, 'stamp');
  add(T.recap, 'ding');

  return { beat, dur, L, T, sfx, full: true };
}
