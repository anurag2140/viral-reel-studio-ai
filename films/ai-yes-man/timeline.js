// #10, "AI ने PPT को perfect बोला". Cue times and sound effects come from vo.json.
import { spans, wordTimes } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const sp = spans(vo);
  // Q: the eleven sentences in order, each with its word times
  const Q = vo.lines.flatMap((l) => sp[l.id].s.map((s) => ({ ...s, words: wordTimes(s) })));
  const at = (i, needle, k = 0) => (Q[i].words.filter((w) => w.word.includes(needle))[k] ?? { t: Q[i].a }).t;
  const T = {
    perfect: at(0, 'perfect'),
    boss: Q[1].a, ten: at(1, 'दस'), mistakes: at(1, 'गलतियाँ'),
    team: Q[2].a, teamWord: at(2, 'team'),
    turn: Q[3].a,
    yes: Q[4].a, haan1: at(4, 'हाँ'), haan2: at(4, 'हाँ', 1), happy: at(4, 'खुश'),
    noPraise: Q[5].a, praise: at(5, 'तारीफ़'), mat: at(5, 'मत'),
    prompt: Q[6].a, strict: at(6, 'सख़्त'), check: at(6, 'check'), three: at(6, 'तीन'), wrong: at(6, 'गलतियाँ'), tell: at(6, 'बताओ'),
    catches: Q[7].a, same: at(7, 'वही'),
    fix: Q[8].a, fixWord: at(8, 'ठीक'),
    next: Q[9].a, good: at(9, 'good'),
    ask: Q[10].a, send: at(10, 'भेजो'),
  };
  T.last = Q[10].b;
  T.follow = T.last + 0.3;
  T.recap = T.follow;
  const dur = T.last + 1.2;
  // the ten red marks on the slide land between "दस" and the end of the sentence
  T.marks = Array.from({ length: 10 }, (_, i) => T.ten + i * Math.min(0.11, (Q[1].b - T.ten) / 10));

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  add(0.05, 'thud');
  add(T.perfect, 'ding', { gain: 0.8 });
  T.marks.forEach((m, i) => add(m, i % 3 === 2 ? 'scratch' : 'tick', { gain: i % 3 === 2 ? 0.5 : 0.8, dur: 0.15 }));
  add(T.team - 0.1, 'whoosh', { dur: 0.4, gain: 0.7 });
  add(T.teamWord, 'thud', { gain: 0.8 });
  add(T.turn - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.haan1, 'pop');
  add(T.haan2, 'pop');
  add(T.haan2 + 0.4, 'pop', { gain: 0.8 });
  add(T.happy, 'pop', { gain: 0.8 });
  add(T.praise - 0.1, 'swipe', { gain: 0.7 });
  add(T.mat, 'scratch', { dur: 0.35 });
  add(T.prompt - 0.2, 'whoosh', { dur: 0.45, gain: 0.7 });
  add(T.strict, 'scratch', { dur: 0.35 });
  add(T.three, 'scratch', { dur: 0.35 });
  add(T.tell + 0.2, 'ding');
  add(T.catches - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  for (let i = 0; i < 3; i++) add(T.same + 0.2 + i * 0.35, 'stamp', { gain: 0.6 });
  for (let i = 0; i < 3; i++) add(T.fixWord - 0.1 + i * 0.22, 'pop', { gain: 0.8 });
  add(T.next - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.good, 'ding');
  add(T.ask + 0.3, 'whoosh', { dur: 0.5, gain: 0.7 });
  add(T.send + 0.25, 'thud', { gain: 0.8 });
  add(T.follow, 'tick', { gain: 1.4 });
  add(T.follow + 0.06, 'ding');

  return { beat, dur, Q, T, sfx, full: true };
}
