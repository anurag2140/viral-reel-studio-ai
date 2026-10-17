// Look tests: one opening, three looks. Cue times and SFX come from vo.json.
import { spans, wordTimes } from '../../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const half = beat / 2;
  const S = spans(vo).hook.s.map((s) => ({ ...s, words: wordTimes(s) }));
  const at = (i, needle) => (S[i].words.find((w) => w.word.includes(needle)) ?? { t: S[i].a }).t;
  const T = {
    night: at(0, 'रात'),
    s2: S[1].a,
    click: at(1, 'click'),
    s3: S[2].a,
    name: at(2, 'Napkin'),
  };
  T.recap = Math.round((T.name + 0.2) / half) * half;
  const dur = S[2].b + 1.0;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  add(0.05, 'thud');
  add(T.night, 'pop');
  add(T.s2 - 0.28, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.click, 'stamp');
  add(T.click + 0.08, 'tick', { gain: 1.3 });
  add(T.s3 - 0.28, 'whoosh', { dur: 0.45, gain: 0.8 });
  add(T.s3 + 0.3, 'thud', { gain: 0.8 });
  add(T.name, 'pop');
  add(T.recap, 'ding');

  return { beat, dur, S, T, sfx, full: true };
}
