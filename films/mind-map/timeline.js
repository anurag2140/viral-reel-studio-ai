// #19, AI जुगाड़ #4: "चालीस page की report, और meeting में जवाब सिर्फ़ तुम्हें पता था" (Gemini Notebook mind maps).
// Cue times and sound effects come from vo.json.
import { spans, wordTimes } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const sp = spans(vo);
  // Q: the fifteen sentences in order, each with its word times
  const Q = vo.lines.flatMap((l) => sp[l.id].s.map((s) => ({ ...s, words: wordTimes(s) })));
  const at = (i, needle, k = 0) => (Q[i].words.filter((w) => w.word.includes(needle))[k] ?? { t: Q[i].a }).t;
  const T = {
    jawab: at(0, 'जवाब'), sirf: at(0, 'सिर्फ़'),
    jabki: Q[1].a, nahin: at(1, 'नहीं'),
    trouble: Q[2].a, das: at(2, 'दस'), mail: at(2, 'mail'), meeting: at(2, 'meeting'), report: at(2, 'report'),
    aankh: Q[3].a, band: at(3, 'बंद'),
    turn: Q[4].a, pdf: at(4, 'PDF'), gemini: at(4, 'Gemini'),
    how: Q[5].a, mindMap: at(5, 'Mind'), dabaya: at(5, 'दबाया'), map: at(5, 'map'),
    branch: Q[6].a, points: at(6, 'points'),
    magic: Q[7].a, paanch: at(7, 'पाँच'), samajh: at(7, 'समझ'),
    follow: Q[8].a, followWord: at(8, 'follow'),
    twist: Q[9].a, jugaad: at(9, 'जुगाड़'),
    click: Q[10].a, clickW: at(10, 'click'), sawal: at(10, 'सवाल'),
    end: Q[11].a, rohan: at(11, 'Rohan'), kab: at(11, 'कब'),
    link: Q[12].a, comment: Q[13].a, post: Q[13].b - 0.08,
    send: Q[14].a, sendWord: at(14, 'भेजो'),
  };
  T.last = Q[14].b;
  T.press = T.last + 0.3; // the Follow button on the card at the very end
  T.fpress = T.followWord + 0.25; // the Follow button during the follow line
  T.lap = T.dabaya + 0.35; // from the help page to the laptop: the map grows
  T.nodeClick = T.sawal - 0.35; // a branch is clicked on the laptop
  const dur = T.last + 1.2;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  // the hook: the meeting, the "0 pages read" chip
  add(0.05, 'ding', { gain: 0.6 });
  add(T.jawab, 'pop');
  add(T.nahin, 'pop', { gain: 0.8 });
  // the night: the mail, the report lands, the yawn
  add(T.trouble - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.mail, 'ding', { gain: 0.7 });
  add(T.report, 'thud', { gain: 1.0 });
  add(T.band, 'swipe', { gain: 0.5 });
  // the page: the PDF goes in, the Mind Map chip
  add(T.turn - 0.26, 'swipe');
  add(T.pdf + 0.1, 'scratch', { dur: 0.3 });
  add(T.mindMap, 'scratch', { dur: 0.35 });
  add(T.dabaya, 'tick', { gain: 1.2 });
  // the laptop: the map grows, branch by branch, then the points
  add(T.lap - 0.1, 'whoosh', { dur: 0.35, gain: 0.7 });
  for (let i = 0; i < 5; i++) add(T.map + 0.1 + i * 0.14, 'pop', { gain: 0.5 + i * 0.06 });
  for (let i = 0; i < 5; i++) add(T.points - 0.6 + i * 0.12, 'tick', { gain: 0.45 });
  // five minutes later
  add(T.magic - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.paanch, 'tick', { gain: 1.0 });
  add(T.samajh, 'ding');
  // the follow line
  add(T.follow + 0.05, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.follow + 0.05, 'thud', { gain: 0.7 });
  add(T.fpress, 'tick', { gain: 1.3 });
  // the twist: the page, a branch is clicked, the answer
  add(T.jugaad, 'pop');
  add(T.click - 0.26, 'swipe');
  add(T.clickW, 'scratch', { dur: 0.35 });
  add(T.nodeClick, 'tick', { gain: 1.2 });
  add(T.nodeClick + 0.3, 'pop');
  // the meeting again; Rohan's question
  add(T.end - 0.26, 'whoosh', { dur: 0.45, gain: 0.8 });
  add(T.rohan, 'pop', { gain: 0.7 });
  add(T.kab, 'pop');
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
