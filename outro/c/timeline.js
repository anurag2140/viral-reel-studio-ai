// Outro C: a doubt becomes a comment, the comment becomes the next video, then follow.
import { spans, wordAt } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const L = spans(vo);
  const [q, c] = L.doubt.s;
  const [N, F] = L.next.s;

  const T = {
    tangle: -0.18, // the scribble is already being drawn on the first frame
    qs: [0, 1, 2].map((i) => wordAt(q, 'समझ') + i * 0.1),
    toComment: c.a - 0.25,
    box: c.a - 0.16,
    type: { a: c.a + 0.02, b: c.b - 0.06 },
    send: c.b + 0.02,
    toVideo: N.a - 0.3,
    video: N.a - 0.14,
    under: wordAt(N, 'उसी'),
    play: wordAt(N, 'बन'),
    toFollow: F.a - 0.3,
    row: F.a - 0.22,
    btn: F.a - 0.08,
    press: wordAt(F, 'करो') + 0.15,
    recap: Math.ceil((F.b + 0.15) / beat) * beat,
  };
  const dur = T.recap + 2 * beat;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +t.toFixed(3), type, ...o });
  add(0, 'scratch', { dur: 0.6 });
  T.qs.forEach((t) => add(t, 'pop', { gain: 0.8 }));
  add(T.box + 0.28, 'paper');
  for (let i = 0; i < 5; i++) add(T.type.a + ((T.type.b - T.type.a) * i) / 5, 'tick');
  add(T.send, 'pop');
  add(T.toVideo, 'whoosh', { dur: 0.45 });
  add(T.video + 0.28, 'thud');
  add(T.under, 'swipe', { dur: 0.3 });
  add(T.under + 0.22, 'stamp', { gain: 0.7 });
  add(T.play, 'pop');
  add(T.toFollow, 'whoosh', { dur: 0.4, gain: 0.7 });
  add(T.row + 0.25, 'paper');
  add(T.btn + 0.28, 'paper');
  add(T.press, 'stamp');
  add(T.recap, 'ding');

  return { beat, dur, L, T, sfx };
}
