// #04 AI का इतिहास: 1956 से 2026. Cue times and SFX, all from vo.json.
import { spans, wordAt } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const L = spans(vo);
  const H = L.hook.s;
  const N = L.name.s;
  const W = L.winter.s;
  const W2 = L.twice.s[0];
  const C = L.chess.s[0];
  const D = L.deep.s[0];
  const G = L.gpt.s[0];
  const Z = L.pay.s;

  const T = {
    // hook: the whole 70-year line, with its two falls
    old: wordAt(H[0], 'सत्तर'),
    fail: wordAt(H[1], 'दो'),
    // 1956: the name, and the big promise
    toStart: N[0].a - 0.35,
    name: wordAt(N[0], 'Artificial') - 0.1,
    promise: N[1].a,
    think: wordAt(N[1], 'सोचेगी') - 0.1,
    // the first AI winter
    toWin: W[0].a - 0.35,
    money: wordAt(W[0], 'पैसा'),
    winter: wordAt(W[1], 'winter') - 0.1,
    // the second one
    toWin2: W2.a - 0.3,
    twice: wordAt(W2, 'दो'),
    // 1997, 2012, 2022
    toChess: C.a - 0.35,
    chess: wordAt(C, 'chess'),
    beat: wordAt(C, 'हराया'),
    toDeep: D.a - 0.35,
    deep: wordAt(D, 'deep'),
    won: wordAt(D, 'जीता'),
    toGpt: G.a - 0.35,
    gpt: wordAt(G, 'ChatGPT'),
    // payoff: the whole line again
    toPay: Z[0].a - 0.35,
    years: Z[1].a,
  };
  T.recap = Math.ceil(Z[1].a / (beat / 2)) * (beat / 2);
  const dur = Z[1].b + 0.45; // end right after the payoff

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  add(0.05, 'thud');
  add(T.old, 'stamp');
  add(T.fail, 'swipe');
  add(T.fail + 0.25, 'swipe');
  add(T.toStart, 'whoosh', { dur: 0.5, gain: 0.7 });
  add(T.toStart + 0.5, 'paper');
  add(T.name, 'stamp');
  add(T.think, 'pop');
  add(T.toWin, 'whoosh', { dur: 0.5, gain: 0.7 });
  add(T.money, 'swipe');
  add(T.winter, 'stamp');
  [0, 1, 2].forEach((i) => add(T.winter + 0.2 + i * 0.15, 'tick'));
  add(T.toWin2, 'whoosh', { dur: 0.45, gain: 0.7 });
  add(T.twice, 'stamp', { gain: 0.8 });
  add(T.toChess, 'whoosh', { dur: 0.5, gain: 0.7 });
  add(T.toChess + 0.5, 'paper');
  add(T.chess, 'pop');
  add(T.beat, 'stamp', { gain: 0.8 });
  add(T.toDeep, 'whoosh', { dur: 0.5, gain: 0.7 });
  add(T.toDeep + 0.5, 'paper');
  [0, 1, 2].forEach((i) => add(T.deep + i * 0.1, 'paper', { gain: 0.7 }));
  add(T.won, 'ding', { gain: 0.5 });
  add(T.toGpt, 'whoosh', { dur: 0.5, gain: 0.7 });
  add(T.toGpt + 0.5, 'paper');
  add(T.gpt, 'thud', { gain: 0.8 });
  add(T.gpt + 0.2, 'pop');
  add(T.toPay, 'whoosh', { dur: 0.5, gain: 0.7 });
  add(T.years, 'stamp');
  add(T.recap, 'ding');

  return { beat, dur, L, T, sfx, full: true };
}
