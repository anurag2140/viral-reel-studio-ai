// Outro F: every video, one hard topic, in your language. A hard card is wiped into an easy one.
import { spans, wordAt, wordTimes } from '../../brand/timing.js';

// Split a one-sentence line at its pause into two timed halves (text split after the comma).
function halves(vo, id, span) {
  const line = vo.lines.find((l) => l.id === id);
  const [head, tail] = span.text.split(/(?<=,) /);
  if (!line.pauses.length || !tail) return [span, span];
  const [p0, p1] = line.pauses[0];
  return [{ a: span.a, b: line.start + p0, text: head }, { a: line.start + p1, b: span.b, text: tail }];
}

export function build(vo) {
  const beat = 60 / vo.bpm;
  const L = spans(vo);
  const P = L.promise.s[0];
  const C = L.cta.s[0];
  const [P1, P2] = halves(vo, 'promise', P);
  const [C1, C2] = halves(vo, 'cta', C);
  // word times that respect the pause, for the captions
  const words = { P: [...wordTimes(P1), ...wordTimes(P2)], C: [...wordTimes(C1), ...wordTimes(C2)] };

  const T = {
    throw: [wordAt(P1, 'video'), wordAt(P1, 'एक')],
    hard: wordAt(P1, 'मुश्किल') + 0.05,
    wipe: { a: P1.b - 0.02, d: 0.36 },
    easy: P1.b + 0.3,
    toCta: C.a - 0.22,
    logo: C.a - 0.02,
    user: C.a + 0.14,
    btn: C.a + 0.05,
    press: wordAt(C1, 'करो') + 0.14,
    box: C2.a - 0.1,
    type: { a: wordAt(C2, 'topic'), b: wordAt(C2, 'बताओ') },
    send: wordAt(C2, 'बताओ') + 0.22,
    recap: Math.ceil((C.b + 0.15) / beat) * beat,
  };
  const dur = T.recap + 2 * beat;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +t.toFixed(3), type, ...o });
  add(0.04, 'paper');
  T.throw.forEach((t) => add(t, 'swipe', { dur: 0.22 }));
  add(T.hard, 'stamp');
  add(T.wipe.a, 'swipe', { dur: T.wipe.d + 0.1, gain: 1.2 });
  add(T.wipe.a, 'scratch', { dur: T.wipe.d });
  add(T.easy, 'stamp', { gain: 0.8 });
  add(T.easy + 0.05, 'ding', { gain: 0.5 });
  add(T.toCta, 'whoosh', { dur: 0.4, gain: 0.7 });
  add(T.logo + 0.14, 'stamp', { gain: 1.1 });
  add(T.user + 0.28, 'paper', { gain: 0.8 });
  add(T.press, 'stamp');
  add(T.box + 0.28, 'paper');
  for (let i = 0; i < 5; i++) add(T.type.a + ((T.type.b - T.type.a) * i) / 5, 'tick');
  add(T.send, 'pop');
  add(T.recap, 'ding');

  return { beat, dur, L, T, sfx, words };
}
