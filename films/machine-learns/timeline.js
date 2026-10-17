// #02 Machine कैसे सीखती है? Cue times and SFX, all from vo.json.
import { spans, wordAt } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const L = spans(vo);
  const H = L.hook.s;
  const K = L.kid.s;
  const K2 = L.kid2.s[0];
  const M = L.machine.s;
  const P = L.loop.s;
  const Q = L.pattern.s;
  const Z = L.payoff.s;

  const T = {
    // hook: nobody taught ChatGPT rules
    cross: wordAt(H[0], 'नहीं'),
    q: H[1].a,
    // a child learns "cat" from cats, not rules
    toKid: K[0].a - 0.3,
    kid: K[0].a - 0.15,
    askCat: wordAt(K[0], 'बिल्ली') - 0.1,
    rule: K[1].a - 0.12,
    ruleX: wordAt(K[1], 'नहीं'),
    cats: [0, 1, 2, 3].map((i) => K[2].a - 0.05 + i * 0.26),
    newcat: K2.a,
    know: wordAt(K2, 'खुद'),
    // the machine gets thousands of labelled photos
    toMachine: M[0].a - 0.3,
    machine: M[0].a - 0.12,
    pile: { a: M[0].a + 0.3, b: wordAt(M[1], 'और') + 0.2 }, // photos start to arrive while the machine is introduced
    labels: wordAt(M[1], 'सही') - 0.1,
    stamp: wordAt(M[2], 'examples'),
    // guess, wrong, adjust, right
    toLoop: P[0].a - 0.28,
    guess: wordAt(P[0], 'अंदाज़ा'),
    wrong: wordAt(P[1], 'ग़लत'),
    tune: wordAt(P[1], 'खुद'),
    right: P[1].b - 0.2,
    // the pattern
    toPattern: Q[0].a - 0.28,
    merge: Q[0].a - 0.1,
    trace: wordAt(Q[0], 'pattern') - 0.1,
    every: Q[1].a + 0.1,
    // payoff
    toPay: Z[0].a - 0.28,
    book: Z[0].a - 0.14,
    bookX: wordAt(Z[0], 'नहीं'),
    flow: Z[1].a - 0.05,
    flowPat: wordAt(Z[1], 'pattern') - 0.08,
    gpt: Z[2].a - 0.12,
    gptTick: wordAt(Z[2], 'यही'),
  };
  T.recap = Math.ceil(Z[2].a / (beat / 2)) * (beat / 2);
  const dur = Z[2].b + 0.45; // end right after the payoff

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  add(0.05, 'thud');
  add(T.cross, 'swipe');
  add(T.cross + 0.1, 'stamp', { gain: 0.8 });
  add(T.q, 'pop');
  add(T.toKid, 'whoosh', { dur: 0.45, gain: 0.7 });
  add(T.kid, 'scratch', { dur: 0.3 });
  add(T.askCat + 0.28, 'paper');
  add(T.rule + 0.28, 'paper');
  add(T.ruleX, 'swipe');
  T.cats.forEach((t) => add(t + 0.25, 'paper', { gain: 0.8 }));
  add(T.newcat + 0.25, 'paper');
  add(T.know, 'pop');
  add(T.know + 0.05, 'ding', { gain: 0.5 });
  add(T.toMachine, 'whoosh', { dur: 0.45, gain: 0.7 });
  add(T.machine, 'scratch', { dur: 0.3 });
  for (let i = 0; i < 12; i++) add(T.pile.a + ((T.pile.b - T.pile.a) * i) / 12 + 0.15, 'tick', { gain: 1.1 });
  add(T.labels, 'pop', { gain: 0.8 });
  add(T.stamp, 'stamp');
  add(T.toLoop, 'whoosh', { dur: 0.4, gain: 0.6 });
  add(T.guess, 'pop');
  add(T.wrong, 'swipe');
  [0, 1, 2].forEach((i) => add(T.tune + i * 0.12, 'tick', { gain: 1.2 }));
  add(T.right, 'pop');
  add(T.right + 0.04, 'ding', { gain: 0.5 });
  add(T.toPattern, 'whoosh', { dur: 0.45, gain: 0.7 });
  [0, 1, 2, 3, 4].forEach((i) => add(T.merge + 0.2 + i * 0.09, 'paper', { gain: 0.7 }));
  add(T.trace, 'scratch', { dur: 0.6 });
  add(T.trace + 0.55, 'stamp', { gain: 0.8 });
  [0, 1, 2, 3].forEach((i) => add(T.every + i * 0.3, 'pop', { gain: 0.7 }));
  add(T.toPay, 'whoosh', { dur: 0.4, gain: 0.6 });
  add(T.book + 0.28, 'paper');
  add(T.bookX, 'swipe');
  add(T.flow + 0.25, 'paper');
  add(T.flowPat, 'scratch', { dur: 0.35 });
  add(T.gpt + 0.28, 'thud', { gain: 0.8 });
  add(T.gptTick, 'stamp');
  add(T.recap, 'ding');

  return { beat, dur, L, T, sfx, full: true };
}
