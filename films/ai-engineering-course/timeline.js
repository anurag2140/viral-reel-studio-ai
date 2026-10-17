// #07, "AI सीखना है? यह रहा पूरा नक़्शा". Cue times and sound effects come from vo.json, so
// that picture and sound use the same numbers.
import { spans, wordTimes } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const sp = spans(vo);
  // Q: the sixteen sentences in order, each with its word times
  const Q = vo.lines.flatMap((l) => sp[l.id].s.map((s) => ({ ...s, words: wordTimes(s) })));
  const w = (i, n) => Q[i].words[n].t;
  const T = {
    map: Q[1].a, free: w(1, 5),                        // "यह रहा पूरा नक़्शा, बिल्कुल free"
    trouble: Q[2].a, forty: w(2, 3),                   // "चालीस tab"
    ten: Q[3].a, five: w(3, 2), plan: w(3, 5), none: w(3, 8),
    turn: Q[4].a, repo: w(4, 4),                       // "GitHub पर एक repo"
    name: Q[5].a,                                      // "AI Engineering from Scratch"
    how: Q[6].a, twenty: w(6, 1), stack: w(6, 4),      // "बीस phase", "एक के ऊपर एक"
    floors: Q[7].a, math: w(7, 2), up: w(7, 3), agents: w(7, 5),
    n528: Q[8].a, allfree: w(8, 4), free2: w(8, 6),    // "528 lesson, और सब free"
    twist: Q[9].a, useful: w(9, 3),
    tutor: Q[10].a, test: w(10, 5), tells: w(10, 10), start: w(10, 13),
    end: Q[11].a, close: w(11, 1), shut: w(11, 3),     // "अब चालीस tab बंद"
    one: Q[12].a,                                      // "सिर्फ़ एक खुला है"
    link: Q[13].a, comment: Q[14].a, post: Q[14].b - 0.08,
    ask: Q[15].a, send: w(15, 3),                      // "भेजो"
  };
  T.last = Q[15].b;
  T.follow = T.last + 0.3;   // the Follow button is pressed
  T.recap = T.follow;
  const dur = T.last + 1.2;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  add(0.05, 'thud');
  add(T.map - 0.05, 'whoosh', { dur: 0.45, gain: 0.8 });
  for (let i = 0; i < 5; i++) add(T.map + 0.15 + i * 0.18, 'tick', { gain: 0.5 });
  add(T.free, 'stamp');
  add(T.trouble - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  for (let i = 0; i < 6; i++) add(T.trouble + 0.2 + i * 0.2, 'pop', { gain: 0.6 });
  add(T.ten - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.ten + 0.05, 'pop');
  add(T.five, 'pop');
  add(T.plan, 'paper');
  add(T.none, 'scratch', { dur: 0.35 });
  add(T.turn - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.turn + 0.3, 'whoosh', { dur: 0.5, gain: 0.7 });
  add(T.repo + 0.35, 'scratch', { dur: 0.4 });
  add(T.name - 0.2, 'swipe');
  add(T.name + 0.3, 'scratch', { dur: 0.4 });
  add(T.how - 0.2, 'swipe');
  add(T.twenty, 'scratch', { dur: 0.35 });
  add(T.stack - 0.1, 'swipe', { gain: 0.7 });
  add(T.floors - 0.12, 'swipe');
  add(T.math, 'pop');
  add(T.up - 0.1, 'whoosh', { dur: 0.5, gain: 0.7 });
  add(T.agents, 'pop');
  add(T.n528 - 0.28, 'swipe');
  add(T.n528 + 0.5, 'scratch', { dur: 0.4 });
  add(T.allfree - 0.2, 'swipe');
  add(T.free2 - 0.05, 'scratch', { dur: 0.35 });
  add(T.twist - 0.1, 'swipe');
  add(T.useful, 'pop');
  add(T.tutor - 0.28, 'swipe');
  add(T.test, 'scratch', { dur: 0.35 });
  add(T.tells, 'scratch', { dur: 0.35 });
  add(T.start - 0.3, 'swipe');
  add(T.start + 0.05, 'thud');
  add(T.start + 0.3, 'ding');
  add(T.end - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  for (let i = 0; i < 6; i++) add(T.close + i * 0.15, 'tick', { gain: 0.7 });
  add(T.one + 0.1, 'pop');
  add(T.link - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.link + 0.12, 'pop');
  add(T.comment - 0.08, 'swipe', { gain: 0.7 });
  for (let i = 0; i < 4; i++) add(T.comment + 0.25 + i * 0.1, 'tick', { gain: 0.6 });
  add(T.post, 'tick', { gain: 1.3 });
  add(T.ask + 0.3, 'whoosh', { dur: 0.5, gain: 0.7 });
  add(T.send + 0.25, 'thud', { gain: 0.8 });
  add(T.follow, 'tick', { gain: 1.4 });
  add(T.follow + 0.06, 'ding');

  return { beat, dur, Q, T, sfx, full: true };
}
