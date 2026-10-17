// Short outros (2 to 3 seconds): one spoken line, cue times from vo.json.
// The variant (a to g) is the id of the only voice line.
import { spans, wordTimes } from '../../brand/timing.js';

// the word that triggers each variant's own gesture, and the words the caption highlights
const HIT = { a: 'comment', b: 'मत', c: 'comment', d: 'word', e: 'भेजो', f: 'अपनी', g: 'save', h: 'भेज', i: 'भेज', j: 'भेज', k: 'भेज', l: 'भेज' };
// the share outros: something is sent on the word "भेजो", and the button is pressed after it lands
const SHARE = new Set(['e', 'h', 'i', 'j', 'k', 'l']);
export const HL = { a: 'comment', b: 'मत भूलना', c: 'comment', d: 'एक word', e: 'भेजो', f: 'अपनी भाषा', g: 'save', h: 'college group', i: 'Exam', j: 'नहीं पता', k: 'भेजो', l: 'घर' };
const HIT_SFX = { a: 'pop', b: 'swipe', c: 'stamp', d: 'tick', e: 'whoosh', f: 'swipe', g: 'stamp', h: 'whoosh', i: 'whoosh', j: 'whoosh', k: 'whoosh', l: 'whoosh' };

export function build(vo) {
  const beat = 60 / vo.bpm;
  const line = vo.lines[0];
  const id = line.id;
  const S = spans(vo)[id].s[0];

  // Word times. When the line has a comma and the voice paused there, time each half on its own.
  let words = wordTimes(S);
  const [head, tail] = S.text.split(/(?<=,) /);
  if (tail && line.pauses.length) {
    const [p0, p1] = [...line.pauses].sort((x, y) => y[1] - y[0] - (x[1] - x[0]))[0];
    words = [...wordTimes({ a: S.a, b: line.start + p0, text: head }), ...wordTimes({ a: line.start + p1, b: S.b, text: tail })];
  }
  const at = (needle) => (words.find((w) => w.word.includes(needle)) ?? { t: S.a }).t;
  const hit = at(HIT[id]);

  // The button is pressed on the last word (E: after the plane has landed).
  let press = Math.min(words[words.length - 1].t + 0.14, S.b, 2.2); // 2.2 keeps the clip under 3 seconds
  if (SHARE.has(id)) press = Math.min(Math.max(hit + 0.5, S.b - 0.25), S.b + 0.1, 2.2);
  const half = beat / 2;
  const recap = Math.ceil((press - 0.08) / half) * half; // last chord, on the half-beat grid
  const dur = Math.max(2, S.b + 0.4, recap + 0.6);

  const T = {
    logo: -0.12, // the lockup is already landing on the first frame
    user: -0.05,
    btn: 0.02,
    note: -0.22,
    hit,
    press,
    recap,
    friend: at('दोस्त') - 0.05,
    flip: Math.max(0.16, (S.b - 0.15 - hit) / 3),
  };

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  add(0.06, 'thud', { gain: 0.9 });
  add(0.24, 'paper');
  add(0.32, 'paper', { gain: 0.8 });
  add(hit, HIT_SFX[id], SHARE.has(id) ? { dur: 0.45, gain: 0.8 } : {});
  if (id === 'd') for (let k = 1; k <= 3; k++) add(hit + k * T.flip, k === 3 ? 'pop' : 'tick');
  if (SHARE.has(id)) add(hit + 0.45, 'pop');
  if (id === 'f') add(hit + 0.16, 'stamp', { gain: 0.8 });
  if (id === 'g') add(hit + 0.14, 'pop');
  add(press, 'stamp');
  add(recap, 'ding');

  return { beat, dur, id, T, sfx, words, text: S.text, hl: HL[id] };
}
