// TEMPLATE, the short loop (experiment E3). Cue times and sound effects come from vo.json.
// The last line ("अब से") runs into the hook on frame 0, so the reel plays as one loop.
import { spans, wordTimes } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const sp = spans(vo);
  // Q: 0 hook, 1 to 3 how, 4 and 5 the link line, 6 the line that leads back into the hook
  const Q = vo.lines.flatMap((l) => sp[l.id].s.map((s) => ({ ...s, words: wordTimes(s) })));
  const at = (i, needle, k = 0) => (Q[i].words.filter((w) => w.word.includes(needle))[k] ?? { t: Q[i].a }).t;
  const T = {
    clean: at(0, 'साफ़'),
    how: Q[1].a, tool: Q[2].a, press: at(3, 'button'),
    link: Q[4].a, comment: Q[5].a, post: Q[5].b - 0.08,
    back: Q[6].a,
  };
  // The reel ends where it starts: no closing chord (score.mjs puts it on T.recap, here the
  // very end), no follow card (the follow ask is in the post caption).
  const dur = Q[6].b + 0.12;
  T.recap = dur;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  add(T.clean, 'pop');
  add(T.how - 0.22, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(Q[1].a + 0.25, 'tick', { gain: 0.9 }); // the photo is taken
  add(T.tool + 0.1, 'swipe', { gain: 0.7 });
  add(T.press + 0.1, 'tick', { gain: 1.2 });
  add(T.press + 0.3, 'scratch', { dur: 0.4 });
  add(T.link - 0.22, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.link + 0.12, 'pop');
  add(T.comment - 0.08, 'swipe', { gain: 0.7 });
  for (let i = 0; i < 4; i++) add(T.comment + 0.25 + i * 0.1, 'tick', { gain: 0.6 });
  add(T.post, 'tick', { gain: 1.3 });
  add(T.back - 0.22, 'whoosh', { dur: 0.4, gain: 0.8 });

  return { beat, dur, Q, T, sfx, full: true };
}
