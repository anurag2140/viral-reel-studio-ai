// #05 Data: AI का खाना. Cue times and SFX, all from vo.json.
import { spans, wordAt } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const L = spans(vo);
  const H = L.hook.s;
  const D = L.def.s;
  const G = L.good.s[0];
  const B = L.bad.s[0];
  const E = L.ex.s;
  const Z = L.pay.s[0];
  const every = (a, n, step) => Array.from({ length: n }, (_, i) => a + i * step);

  const T = {
    // hook: AI eats too; wrong food gives a wrong answer
    eat0: every(0.05, 3, 0.42),
    rotten: H[1].a + 0.15,
    wrongAns: wordAt(H[1], 'जवाब') - 0.15,
    // AI's food is data: text, photos, sound, numbers
    toDef: D[0].a - 0.3,
    data: wordAt(D[0], 'data') - 0.1,
    kinds: ['text', 'photos', 'आवाज़', 'numbers'].map((w) => wordAt(D[1], w) - 0.05),
    // good data in, right learning
    toFeed: G.a - 0.3,
    goodEat: every(G.a + 0.15, 4, 0.36),
    goodOk: wordAt(G, 'सीखता') - 0.1,
    // wrong or one-sided data in, wrong learning
    badEat: every(B.a + 0.25, 5, 0.38),
    badNo: wordAt(B, 'सीखता') - 0.15,
    // example: only white cats, then a black cat
    exIn: E[0].a - 0.1,
    whiteEat: every(wordAt(E[0], 'सफ़ेद') - 0.1, 4, 0.24),
    black: E[1].a,
    blackNo: wordAt(E[1], 'पहचान'),
    // payoff
    toPay: Z.a - 0.3,
    final: wordAt(Z, 'जैसा') - 0.05,
    like: wordAt(Z, 'वैसा'),
  };
  T.recap = Math.ceil(T.like / (beat / 2)) * (beat / 2);
  const dur = Z.b + 0.45; // end right after the payoff

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  const chomp = (t, g = 1) => { add(t + 0.3, 'pop', { gain: 0.8 * g }); };
  add(0.05, 'thud');
  T.eat0.forEach((t) => chomp(t));
  chomp(T.rotten);
  add(T.wrongAns, 'swipe');
  add(T.wrongAns + 0.12, 'stamp', { gain: 0.8 });
  add(T.toDef, 'whoosh', { dur: 0.45, gain: 0.7 });
  add(T.data, 'stamp');
  T.kinds.forEach((t) => add(t + 0.25, 'paper', { gain: 0.9 }));
  add(T.toFeed, 'whoosh', { dur: 0.45, gain: 0.7 });
  T.goodEat.forEach((t) => chomp(t));
  add(T.goodOk, 'ding', { gain: 0.5 });
  T.badEat.forEach((t) => chomp(t, 0.9));
  add(T.badNo, 'swipe');
  add(T.badNo + 0.12, 'thud', { gain: 0.8 });
  T.whiteEat.forEach((t) => chomp(t, 0.9));
  add(T.black + 0.28, 'paper');
  add(T.blackNo, 'swipe');
  add(T.blackNo + 0.12, 'stamp', { gain: 0.8 });
  add(T.toPay, 'whoosh', { dur: 0.4, gain: 0.6 });
  add(T.final + 0.28, 'thud', { gain: 0.8 });
  add(T.like, 'stamp');
  add(T.recap, 'ding');

  return { beat, dur, L, T, sfx, full: true };
}
