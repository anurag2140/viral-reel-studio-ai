// Outro A: ask for the next topic, then follow. Cue times come from vo.json.
import { spans, wordAt } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const L = spans(vo);
  const [q, c] = L.ask.s;
  const F = L.follow.s[0];
  const send = Math.min(c.b, F.a - 0.85);

  const T = {
    deal: [-0.22, -0.11, 0], // already in flight on the first frame
    q: wordAt(q, 'topic'),
    toComment: c.a - 0.3,
    type: { a: c.a - 0.08, b: send - 0.1 },
    send,
    bubbles: [0, 1, 2].map((i) => send + 0.06 + i * 0.11),
    toFollow: F.a - 0.38,
    logo: F.a - 0.1,
    ring: F.a + 0.18,
    user: wordAt(F, 'अपनी') - 0.05,
    btn: wordAt(F, 'समझना'),
    press: wordAt(F, 'करो') + 0.12,
    recap: Math.ceil((F.b + 0.15) / beat) * beat,
  };
  const dur = T.recap + 2 * beat;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +t.toFixed(3), type, ...o });
  T.deal.forEach((t, i) => add(t + 0.3, 'paper', { gain: 0.9 - i * 0.1 }));
  add(T.q, 'pop');
  add(T.toComment, 'whoosh', { dur: 0.45, gain: 0.7 });
  add(T.toComment + 0.38, 'paper');
  for (let i = 0; i < 6; i++) add(T.type.a + ((T.type.b - T.type.a) * i) / 6, 'tick');
  add(T.send, 'pop');
  T.bubbles.forEach((t) => add(t, 'pop', { gain: 0.7 }));
  add(T.toFollow, 'whoosh', { dur: 0.5 });
  add(T.logo + 0.12, 'thud');
  add(T.ring, 'scratch', { dur: 0.5 });
  add(T.user + 0.28, 'paper');
  add(T.btn + 0.28, 'paper');
  add(T.press, 'stamp');
  add(T.recap, 'ding');

  return { beat, dur, L, T, sfx };
}
