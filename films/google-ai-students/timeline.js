// #09, "College ID है? Google का AI plan एक साल free". Cue times and sounds come from vo.json.
import { spans, wordTimes } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const sp = spans(vo);
  // Q: the fourteen sentences in order, each with its word times
  const Q = vo.lines.flatMap((l) => sp[l.id].s.map((s) => ({ ...s, words: wordTimes(s) })));
  const w = (i, n) => Q[i].words[n].t;
  const T = {
    plan: Q[1].a, four: w(1, 3), free: w(1, 10),        // "चार हज़ार वाला AI plan, एक साल free"
    friend: Q[2].a, pays: w(2, 6),                       // "पैसे भरता है"
    stuck: Q[3].a, limit: w(3, 4),                       // "limit पर अटक जाते हो"
    turn: Q[4].a, offer: w(4, 8),
    plus: Q[5].a, free2: w(5, 7),                        // "Google AI Plus, बिल्कुल free"
    how: Q[6].a, double: w(6, 3),
    gb: Q[7].a,
    two: Q[8].a,
    time: Q[9].a,                                        // "Offer सीमित समय के लिए है"
    paid: Q[10].a, remind: w(10, 10),
    link: Q[11].a, comment: Q[12].a, post: Q[12].b - 0.08,
    ask: Q[13].a, send: w(13, 7),
  };
  T.last = Q[13].b;
  T.follow = T.last + 0.3;
  T.recap = T.follow;
  const dur = T.last + 1.2;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  add(0.05, 'thud');
  add(T.four, 'pop');
  add(T.free - 0.05, 'scratch', { dur: 0.3 });
  add(T.free + 0.1, 'stamp');
  add(T.friend - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  for (let i = 0; i < 3; i++) add(T.pays - 0.3 + i * 0.3, 'paper', { gain: 0.7 });
  add(T.limit, 'thud');
  add(T.turn - 0.2, 'swipe');
  add(T.offer, 'pop');
  add(T.plus - 0.1, 'swipe', { gain: 0.7 });
  add(T.free2 - 0.05, 'scratch', { dur: 0.4 });
  add(T.how - 0.15, 'swipe', { gain: 0.7 });
  add(T.double, 'scratch', { dur: 0.35 });
  add(T.gb + 0.15, 'scratch', { dur: 0.35 });
  add(T.two - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.time, 'pop');
  add(T.paid + 0.1, 'pop');
  add(T.remind, 'ding');
  add(T.link + 0.12, 'pop');
  add(T.comment - 0.08, 'swipe', { gain: 0.7 });
  for (let i = 0; i < 4; i++) add(T.comment + 0.25 + i * 0.1, 'tick', { gain: 0.6 });
  add(T.post, 'tick', { gain: 1.3 });
  add(T.ask + 0.3, 'whoosh', { dur: 0.5, gain: 0.7 });
  add(T.send + 0.2, 'thud', { gain: 0.8 });
  add(T.follow, 'tick', { gain: 1.4 });
  add(T.follow + 0.06, 'ding');

  return { beat, dur, Q, T, sfx, full: true };
}
