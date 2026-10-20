// #15, AI जुगाड़ #2: "तुम्हारे assignment के पाँचों references नकली निकले" (Google Scholar).
// Cue times and sound effects come from vo.json.
import { spans, wordTimes } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const sp = spans(vo);
  // Q: the sixteen sentences in order, each with its word times
  const Q = vo.lines.flatMap((l) => sp[l.id].s.map((s) => ({ ...s, words: wordTimes(s) })));
  const at = (i, needle, k = 0) => (Q[i].words.filter((w) => w.word.includes(needle))[k] ?? { t: Q[i].a }).t;
  const T = {
    fake: at(0, 'नकली'), caught: Q[1].a, oneByOne: at(1, 'एक-एक'), pakad: at(1, 'पकड़'),
    trouble: Q[2].a, ai: at(2, 'AI'), five: at(2, 'पाँच'),
    ten: Q[3].a, title: at(3, 'title'), haazir: at(3, 'हाज़िर'),
    turn: Q[4].a, kitaab: at(4, 'किताब'), nahin: at(4, 'नहीं'),
    why: Q[5].a, sach: at(5, 'सच'), bana: at(5, 'बना'),
    how: Q[6].a, scholar: at(6, 'Google'), quotes: at(6, 'quotes'), search: at(6, 'search'),
    notFound: Q[7].a, nakli: at(7, 'नकली'),
    follow: Q[8].a, followWord: at(8, 'follow'),
    twist: Q[9].a, jugaad: at(9, 'जुगाड़'),
    asli: Q[10].a, cite: at(10, 'Cite'), ready: at(10, 'बना-बनाया'),
    end: Q[11].a, padhe: at(11, 'पढ़े'),
    good: Q[12].a, veryGood: at(12, 'very'),
    link: Q[13].a, comment: Q[14].a, post: Q[14].b - 0.08,
    send: Q[15].a, sendWord: at(15, 'भेज'),
  };
  T.last = Q[15].b;
  T.press = T.last + 0.3; // the Follow button on the card at the very end
  T.recap = T.press;
  T.fpress = T.followWord + 0.25; // the Follow button during the follow line
  const dur = T.last + 1.2;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  // the hook: the marked paper, then five red crosses one by one
  add(0.05, 'thud');
  add(T.fake, 'scratch', { dur: 0.3 });
  for (let i = 0; i < 5; i++) add(T.oneByOne + i * 0.26, 'scratch', { dur: 0.18, gain: 0.6 + i * 0.08 });
  // the night before: the request, Chintu pops up, five books land
  add(T.trouble - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  for (let i = 0; i < 6; i++) add(T.trouble + 0.3 + i * 0.12, 'tick', { gain: 0.5 });
  add(T.ai - 0.05, 'pop');
  for (let i = 0; i < 5; i++) add(T.title + i * 0.16, 'pop', { gain: 0.55 + i * 0.06 });
  add(T.haazir, 'ding', { gain: 0.8 });
  // the turn: the books are bananas; the TRUE stamp
  add(T.kitaab, 'swipe', { gain: 0.7 });
  add(T.nahin, 'thud');
  add(T.sach, 'thud', { gain: 0.9 });
  add(T.bana, 'pop', { gain: 0.7 });
  // how: the page, the quotes, the search, nothing found
  add(T.how - 0.26, 'swipe');
  add(T.scholar + 0.1, 'scratch', { dur: 0.35 });
  add(T.quotes, 'scratch', { dur: 0.35 });
  add(T.search - 0.3, 'whoosh', { dur: 0.4, gain: 0.7 });
  for (let i = 0; i < 6; i++) add(T.search + i * 0.1, 'tick', { gain: 0.5 });
  add(T.notFound, 'thud');
  add(T.nakli - 0.15, 'thud', { gain: 1.0 });
  // the follow line
  add(T.follow + 0.05, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.follow + 0.05, 'thud', { gain: 0.7 });
  add(T.fpress, 'tick', { gain: 1.3 });
  // the twist: the page, Cite, the reference comes out
  add(T.jugaad, 'pop');
  add(T.asli - 0.25, 'swipe');
  add(T.cite + 0.15, 'scratch', { dur: 0.35 });
  add(T.ready - 0.4, 'whoosh', { dur: 0.35, gain: 0.7 });
  add(T.ready - 0.1, 'tick', { gain: 1.2 });
  add(T.ready + 0.2, 'pop');
  add(T.ready + 0.5, 'ding', { gain: 0.8 });
  // the next assignment
  add(T.end - 0.26, 'whoosh', { dur: 0.45, gain: 0.8 });
  for (let i = 0; i < 5; i++) add(T.padhe + i * 0.18, 'tick', { gain: 0.6 });
  add(T.veryGood, 'ding');
  // the link line and the ask
  add(T.link + 0.12, 'pop');
  add(T.comment - 0.08, 'swipe', { gain: 0.7 });
  for (let i = 0; i < 4; i++) add(T.comment + 0.25 + i * 0.1, 'tick', { gain: 0.6 });
  add(T.post, 'tick', { gain: 1.3 });
  add(T.send + 0.2, 'whoosh', { dur: 0.5, gain: 0.7 });
  add(T.sendWord + 0.2, 'thud', { gain: 0.8 });
  add(T.press, 'tick', { gain: 1.4 });
  add(T.press + 0.06, 'ding');

  return { beat, dur, Q, T, sfx, full: true };
}
