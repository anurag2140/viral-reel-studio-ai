// Outro G: save this video for later (bookmark, clock, folder), then comment and follow.
import { halves, spans, wordAt, wordTimes } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const L = spans(vo);
  const S = L.save.s[0];
  const C = L.cta.s[0];
  const [S1, S2] = halves(vo, 'save', S);
  const [C1, C2] = halves(vo, 'cta', C);
  const words = { S: [...wordTimes(S1), ...wordTimes(S2)], C: [...wordTimes(C1), ...wordTimes(C2)] };
  const tuck = wordAt(S2, 'काम');

  const T = {
    save: wordAt(S1, 'save') + 0.03,
    clock: S2.a - 0.08,
    spin: { a: S2.a, b: tuck + 0.15 },
    folder: tuck - 0.28,
    tuck,
    badge: tuck + 0.34,
    toCta: C.a - 0.38,
    box: C.a - 0.14,
    type: { a: wordAt(C1, 'topic') - 0.1, b: wordAt(C1, 'बताओ') },
    send: C1.b,
    photo: C1.b + 0.02,
    btn: C2.a - 0.08,
    press: wordAt(C2, 'करो') + 0.12,
    recap: Math.ceil((C.b + 0.15) / beat) * beat,
  };
  const dur = T.recap + 2 * beat;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +t.toFixed(3), type, ...o });
  add(0.04, 'paper');
  add(T.save, 'stamp');
  add(T.save + 0.14, 'pop');
  add(T.clock, 'pop', { gain: 0.8 });
  for (let i = 0; i < 6; i++) add(T.spin.a + ((T.spin.b - T.spin.a) * i) / 6, 'tick');
  add(T.folder, 'scratch', { dur: 0.25 });
  add(T.tuck, 'swipe', { dur: 0.3 });
  add(T.tuck + 0.3, 'paper', { gain: 1.2 });
  add(T.badge, 'pop');
  add(T.toCta, 'whoosh', { dur: 0.45, gain: 0.7 });
  add(T.box + 0.28, 'paper');
  for (let i = 0; i < 5; i++) add(T.type.a + ((T.type.b - T.type.a) * i) / 5, 'tick');
  add(T.send, 'pop');
  add(T.photo + 0.28, 'thud', { gain: 0.8 });
  add(T.photo + 0.4, 'swipe', { dur: 0.15 });
  add(T.btn + 0.28, 'paper');
  add(T.press, 'stamp');
  add(T.recap, 'ding');

  return { beat, dur, L, T, sfx, words };
}
