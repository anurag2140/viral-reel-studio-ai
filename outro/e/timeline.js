// Outro E: send this video to a friend who fears AI (a paper plane), then comment the next topic.
import { spans, wordAt } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const L = spans(vo);
  const S = L.send.s[0];
  const C = L.ask.s[0];
  const fold = wordAt(S, 'भेजो') - 0.05;
  const land = wordAt(S, 'डरता');

  const T = {
    fear: wordAt(S, 'दोस्त'),
    fold,
    fly: { a: fold + 0.12, b: land },
    land,
    toComment: C.a - 0.38,
    box: C.a - 0.16,
    type: { a: C.a + 0.08, b: wordAt(C, 'comment') - 0.05 },
    lock: wordAt(C, 'comment') - 0.05,
    send: wordAt(C, 'बताओ'),
    btn: wordAt(C, 'बताओ') - 0.25,
    press: C.b + 0.12,
    recap: Math.ceil((C.b + 0.15) / beat) * beat,
  };
  const dur = T.recap + 2 * beat;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +t.toFixed(3), type, ...o });
  add(0.05, 'paper');
  add(T.fear, 'pop');
  add(T.fold, 'paper', { gain: 1.2 });
  add(T.fold + 0.06, 'scratch', { dur: 0.15 });
  add(T.fly.a, 'whoosh', { dur: T.fly.b - T.fly.a, gain: 0.8 });
  add(T.land, 'pop');
  add(T.land + 0.1, 'ding', { gain: 0.5 });
  add(T.toComment, 'whoosh', { dur: 0.45, gain: 0.7 });
  add(T.box + 0.28, 'paper');
  for (let i = 0; i < 5; i++) add(T.type.a + ((T.type.b - T.type.a) * i) / 5, 'tick');
  add(T.lock + 0.28, 'thud', { gain: 0.8 });
  add(T.send, 'pop');
  add(T.btn + 0.28, 'paper');
  add(T.press, 'stamp');
  add(T.recap, 'ding');

  return { beat, dur, L, T, sfx };
}
