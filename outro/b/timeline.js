// Outro B: vote between the three topics, comment, then follow. Cue times come from vo.json.
import { spans, wordAt } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const L = spans(vo);
  const P = L.pick.s[0];
  const [q, c] = L.ask.s;
  const F = L.follow.s[0];
  // the three options are separated by pauses in the voice
  const pk = vo.lines.find((l) => l.id === 'pick');
  const said = pk.pauses.length >= 2
    ? [0, pk.pauses[0][1], pk.pauses[1][1] + 0.15].map((x) => pk.start + x)
    : [P.a, wordAt(P, 'Cloud'), wordAt(P, 'Cyber')];

  const hop = beat / 2;
  const hops = [];
  for (let t = q.a; t < c.a - 0.05; t += hop) hops.push(t);
  hops.push(c.a); // the last hop lands on the choice

  const T = {
    slam: [0.03, said[1] + 0.03, said[2] + 0.03], // impact times; the first card is in flight on frame 0
    said,
    hops, // selector jumps card to card; card index = (i % 3), forced to 1 on the last
    choice: c.a,
    box: c.a - 0.12,
    type: { a: c.a + 0.12, b: c.b - 0.05 },
    send: c.b + 0.02,
    toFollow: F.a - 0.38,
    note: F.a - 0.16,
    remind: wordAt(F, 'मत'),
    press: wordAt(F, 'भूलना') + 0.22,
    recap: Math.ceil((F.b + 0.15) / beat) * beat,
  };
  const dur = T.recap + 2 * beat;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +t.toFixed(3), type, ...o });
  T.slam.forEach((t) => add(t, 'thud', { gain: 0.9 }));
  T.slam.forEach((t) => add(t + 0.2, 'scratch', { dur: 0.3 }));
  hops.forEach((t, i) => add(t, i === hops.length - 1 ? 'swipe' : 'tick'));
  add(T.choice + 0.15, 'pop');
  add(T.box + 0.28, 'paper');
  for (let i = 0; i < 4; i++) add(T.type.a + ((T.type.b - T.type.a) * i) / 4, 'tick');
  add(T.send, 'pop');
  add(T.toFollow, 'whoosh', { dur: 0.5 });
  add(T.note + 0.3, 'thud');
  add(T.note + 0.32, 'paper');
  add(T.remind, 'swipe', { dur: 0.35 });
  add(T.press, 'stamp');
  add(T.recap, 'ding');

  return { beat, dur, L, T, sfx };
}
