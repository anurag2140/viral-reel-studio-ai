// #14, AI Hack #1: "Your boss thinks you worked all weekend on this deck." (Gamma)
// Cue times and sound effects come from vo.json.
import { spans, wordTimes } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const sp = spans(vo);
  // Q: the seventeen sentences in order, each with its word times
  const Q = vo.lines.flatMap((l) => sp[l.id].s.map((s) => ({ ...s, words: wordTimes(s) })));
  const at = (i, needle, k = 0) => (Q[i].words.filter((w) => w.word.includes(needle))[k] ?? { t: Q[i].a }).t;
  const T = {
    boss: at(0, 'boss'), weekend: at(0, 'weekend'), deck: at(0, 'deck'),
    minute: at(1, 'minute'), took: Q[1].a,
    trouble: Q[2].a, sunday: at(2, 'Sunday'), due: at(2, 'due'), nine: at(2, 'nine'),
    empty: Q[3].a, emptyWord: at(3, 'empty'),
    turn: Q[4].a, rohan: at(4, 'Rohan'), gamma: at(4, 'Gamma'),
    free: Q[5].a, freeWord: at(5, 'free'),
    paste: Q[6].a, notes: at(6, 'notes'),
    click: Q[7].a, generate: at(7, 'Generate'),
    magic: Q[8].a, design: at(8, 'design'), pictures: at(8, 'pictures'), aboutMin: at(8, 'minute'),
    follow: Q[9].a, followWord: at(9, 'Follow'),
    twist: Q[10].a, best: at(10, 'best'),
    exp: Q[11].a, exportWord: at(11, 'Export'), ppt: at(11, 'PowerPoint'),
    end: Q[12].a, monday: at(12, 'Monday'), howLong: at(12, 'long'),
    smile: Q[13].a, smileWord: at(13, 'smile'),
    link: Q[14].a, comment: Q[15].a, post: Q[15].b - 0.08,
    send: Q[16].a, sendWord: at(16, 'Send'), hand: at(16, 'hand'),
  };
  T.last = Q[16].b;
  T.press = T.last + 0.3; // the Follow button on the card at the very end
  T.recap = T.press;
  const dur = T.last + 1.2;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  // the hook: the boss is already amazed; the weekend bubble, the one-minute timer
  add(0.05, 'thud');
  add(T.weekend, 'pop', { gain: 0.8 });
  add(T.minute, 'ding');
  // the trouble: Sunday night at the desk, the due note, then the empty slide
  add(T.trouble - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.sunday, 'paper');
  add(T.nine, 'thud', { gain: 0.8 });
  add(T.empty - 0.26, 'whoosh', { dur: 0.4, gain: 0.7 });
  add(T.emptyWord, 'scratch', { dur: 0.3 });
  // Rohan's message, the pages
  add(T.rohan - 0.1, 'pop');
  add(T.gamma - 0.3, 'swipe');
  add(T.gamma + 0.1, 'scratch', { dur: 0.35 });
  add(T.free - 0.2, 'swipe', { gain: 0.8 });
  add(T.freeWord, 'scratch', { dur: 0.35 });
  // the notes go in, Generate is pressed
  add(T.paste - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.notes, 'paper');
  add(T.generate + 0.2, 'tick', { gain: 1.2 });
  // the magic: ten slides pop in, the timer stops
  for (let i = 0; i < 10; i++) add(T.magic + 0.1 + i * 0.16, 'pop', { gain: 0.45 + i * 0.04 });
  add(T.aboutMin + 0.2, 'ding');
  // the follow line
  add(T.follow + 0.05, 'thud', { gain: 0.7 });
  add(T.followWord + 0.2 + 0.3, 'tick', { gain: 1.3 });
  // the twist: the page, then the file comes out
  add(T.twist - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.exp - 0.2, 'swipe');
  add(T.exportWord + 0.2, 'scratch', { dur: 0.35 });
  add(T.ppt - 0.2, 'whoosh', { dur: 0.35, gain: 0.7 });
  add(T.ppt + 0.15, 'pop');
  add(T.ppt + 0.5, 'ding', { gain: 0.8 });
  // Monday: the boss asks, I smile
  add(T.end - 0.26, 'whoosh', { dur: 0.45, gain: 0.8 });
  add(T.howLong, 'pop', { gain: 0.8 });
  add(T.smileWord, 'ding');
  // the link line and the ask
  add(T.link + 0.12, 'pop');
  add(T.comment - 0.08, 'swipe', { gain: 0.7 });
  for (let i = 0; i < 4; i++) add(T.comment + 0.25 + i * 0.1, 'tick', { gain: 0.6 });
  add(T.post, 'tick', { gain: 1.3 });
  add(T.send + 0.3, 'whoosh', { dur: 0.5, gain: 0.7 });
  add(T.hand, 'thud', { gain: 0.8 });
  add(T.press, 'tick', { gain: 1.4 });
  add(T.press + 0.06, 'ding');

  return { beat, dur, Q, T, sfx, full: true };
}
