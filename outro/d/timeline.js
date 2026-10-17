// Outro D: "tell us in one word". A word reel spins and stops on a question mark, then follow.
import { spans, wordAt } from '../../brand/timing.js';

export const WORDS = ['RAG', 'Docker', 'VPN', 'LLM', 'API', 'Firewall', 'GPU', 'Kubernetes', 'Phishing', '?'];

export function build(vo) {
  const beat = 60 / vo.bpm;
  const L = spans(vo);
  const Q = L.ask.s[0];
  const F = L.follow.s[0];
  const ask = vo.lines.find((l) => l.id === 'ask');
  // the reel stops in the pause after "बताओ,"
  const stop = ask.pauses.length ? ask.start + ask.pauses[0][1] - 0.05 : wordAt(Q, 'अगला');

  const K = WORDS.length - 1;
  const A = -0.12; // the reel is already spinning on the first frame
  // reel position in items (0..K) and its speed in items per second
  const reel = (t) => {
    const p = Math.min(1, Math.max(0, (t - A) / (stop - A)));
    return { o: K * (1 - (1 - p) ** 2), v: p < 1 ? (K * 2 * (1 - p)) / (stop - A) : 0 };
  };

  const T = {
    stop,
    box: -0.3, // the comment box is there from the first frame
    hint: stop + 0.2,
    toFollow: F.a - 0.38,
    ground: F.a - 0.32,
    roll: { a: F.a - 0.26, b: F.a + 0.24 },
    bubble: wordAt(F, 'अपनी') - 0.02,
    user: wordAt(F, 'सीखना') - 0.1,
    btn: wordAt(F, 'तो') - 0.2,
    press: wordAt(F, 'करो') + 0.12,
    recap: Math.ceil((F.b + 0.15) / beat) * beat,
  };
  const dur = T.recap + 2 * beat;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +t.toFixed(3), type, ...o });
  // one tick each time a word passes the window
  for (let k = 1; k < K; k++) {
    const p = 1 - (1 - k / K) ** (1 / 2);
    const t = A + p * (stop - A);
    if (t > 0) add(t, 'tick', { gain: 1.2 });
  }
  add(T.stop, 'stamp', { gain: 0.8 });
  add(T.hint, 'swipe', { dur: 0.25 });
  add(T.toFollow, 'whoosh', { dur: 0.5 });
  add(T.ground, 'scratch', { dur: 0.35 });
  add(T.roll.b, 'thud', { gain: 0.8 });
  add(T.bubble, 'pop');
  add(T.user + 0.28, 'paper');
  add(T.btn + 0.28, 'paper');
  add(T.press, 'stamp');
  add(T.recap, 'ding');

  return { beat, dur, L, T, sfx, reel };
}
