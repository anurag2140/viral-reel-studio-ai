// #17, AI से कमाई #1: "Junior ने resume के पैसे दिए, और वो तुम्हारी पहली कमाई थी" (Gemini and Canva).
// The first money reel (T4). Cue times and sound effects come from vo.json.
import { spans, wordTimes } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const sp = spans(vo);
  // Q: the sixteen sentences in order, each with its word times
  const Q = vo.lines.flatMap((l) => sp[l.id].s.map((s) => ({ ...s, words: wordTimes(s) })));
  const at = (i, needle, k = 0) => (Q[i].words.filter((w) => w.word.includes(needle))[k] ?? { t: Q[i].a }).t;
  const T = {
    paise: at(0, 'पैसे'), kamai: at(0, 'कमाई'), half: Q[1].a, ai: at(1, 'AI'),
    trouble: Q[2].a, internship: at(2, 'internship'), ask: Q[3].a, banaDoge: at(3, 'बना'),
    turn: Q[4].a, gemini: at(4, 'Gemini'), likha: at(4, 'लिखा'), ats: at(4, 'ATS'),
    how: Q[5].a, canva: at(5, 'Canva'), free: at(5, 'free'), daal: at(5, 'डाल'),
    ready: Q[6].a,
    magic: Q[7].a, dekha: at(7, 'देखा'), paise2: at(7, 'पैसे'),
    follow: Q[8].a, followWord: at(8, 'follow'),
    twist: Q[9].a, kamai2: at(9, 'कमाई'),
    group: Q[10].a, batch: at(10, 'batch'), bheja: at(10, 'भेज'),
    catch: Q[11].a, dheere: at(11, 'धीरे'), check: at(11, 'check'),
    end: Q[12].a, chai: at(12, 'chai'),
    link: Q[13].a, comment: Q[14].a, post: Q[14].b - 0.08,
    send: Q[15].a, sendWord: at(15, 'भेजो'),
  };
  T.lastWord = Q[15].b;
  T.press = T.lastWord + 0.3; // the Follow button on the card at the very end
  T.recap = T.press;
  T.fpress = T.followWord + 0.25;
  const dur = T.lastWord + 1.2;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  // the hook: the money held out, "पहली कमाई"
  add(0.05, 'thud');
  add(T.kamai, 'ding');
  add(T.ai, 'pop', { gain: 0.8 });
  // the ask: the old file, her question
  add(T.trouble - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.internship, 'paper');
  add(T.banaDoge, 'pop');
  // Gemini: the page, the prompt
  add(T.turn - 0.25, 'swipe');
  add(T.gemini + 0.15, 'scratch', { dur: 0.35 });
  add(T.ats, 'scratch', { dur: 0.35 });
  // Canva: the page, the template, the text goes in
  add(T.how - 0.25, 'swipe', { gain: 0.8 });
  add(T.free, 'scratch', { dur: 0.35 });
  add(T.daal - 0.3, 'whoosh', { dur: 0.4, gain: 0.7 });
  add(T.daal, 'paper');
  add(T.ready, 'ding');
  // she pays
  add(T.magic - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.paise2, 'pop');
  // the follow line
  add(T.follow + 0.05, 'thud', { gain: 0.7 });
  add(T.fpress, 'tick', { gain: 1.3 });
  // the group: messages pour in
  add(T.kamai2, 'pop');
  add(T.group - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  for (let i = 0; i < 4; i++) add(T.batch - 0.2 + i * 0.25, 'pop', { gain: 0.5 + i * 0.08 });
  // the catch: slow, checked by hand
  add(T.catch - 0.26, 'whoosh', { dur: 0.4, gain: 0.7 });
  for (let i = 0; i < 3; i++) add(T.check + i * 0.2, 'scratch', { dur: 0.18, gain: 0.6 });
  // chai for everyone
  add(T.end - 0.26, 'whoosh', { dur: 0.45, gain: 0.8 });
  for (let i = 0; i < 3; i++) add(T.chai + i * 0.18, 'pop', { gain: 0.6 });
  add(T.chai + 0.6, 'ding', { gain: 0.8 });
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
