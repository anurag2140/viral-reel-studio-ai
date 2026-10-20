// #16, AI जुगाड़ #3: "इस बार interview में Priya Ma'am impressed हो गईं" (Gemini Live as a mock interviewer).
// Cue times and sound effects come from vo.json.
import { spans, wordTimes } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const sp = spans(vo);
  // Q: the seventeen sentences in order, each with its word times
  const Q = vo.lines.flatMap((l) => sp[l.id].s.map((s) => ({ ...s, words: wordTimes(s) })));
  const at = (i, needle, k = 0) => (Q[i].words.filter((w) => w.word.includes(needle))[k] ?? { t: Q[i].a }).t;
  const T = {
    impressed: at(0, 'impressed'), last: Q[1].a, atak: at(1, 'अटक'),
    trouble: Q[2].a, kaanp: at(2, 'काँपने'), kal: Q[3].a, iv: at(3, 'interview'),
    turn: Q[4].a, gemini: at(4, 'Gemini'), mock: at(4, 'mock'),
    free: Q[5].a, freeWord: at(5, 'free'),
    how: Q[6].a, bolo: at(6, 'बोलो'), lo: at(6, 'लो'),
    asks: Q[7].a, answer: at(7, 'बोलकर'),
    magic: Q[8].a, tone: at(8, 'tone'), clarity: at(8, 'clarity'), sudhar: at(8, 'सुधारना'),
    follow: Q[9].a, followWord: at(9, 'follow'),
    twist: Q[10].a, jugaad: at(10, 'जुगाड़'),
    jd: Q[11].a, job2: at(11, 'उसी'), poochhega: at(11, 'पूछेगा'),
    end: Q[12].a, same: at(12, 'सवाल'),
    smile: Q[13].a, smileWord: at(13, 'मुस्कुरा'),
    link: Q[14].a, comment: Q[15].a, post: Q[15].b - 0.08,
    send: Q[16].a, sendWord: at(16, 'भेज'),
  };
  T.lastWord = Q[16].b;
  T.press = T.lastWord + 0.3; // the Follow button on the card at the very end
  T.recap = T.press;
  T.fpress = T.followWord + 0.25; // the Follow button during the follow line
  const dur = T.lastWord + 1.2;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  // the hook: she is impressed; the memory of last time
  add(0.05, 'thud');
  add(T.impressed, 'ding');
  add(T.last - 0.1, 'swipe', { gain: 0.7 });
  add(T.atak, 'scratch', { dur: 0.3 });
  // the night before: the shaky answer, the note
  add(T.trouble - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.kaanp, 'scratch', { dur: 0.3, gain: 0.7 });
  add(T.iv, 'thud', { gain: 0.8 });
  // the turn: the phone, the pages
  add(T.turn + 0.1, 'pop');
  add(T.gemini - 0.3, 'swipe');
  add(T.gemini + 0.15, 'scratch', { dur: 0.35 });
  add(T.mock, 'scratch', { dur: 0.35 });
  add(T.free - 0.2, 'swipe', { gain: 0.8 });
  add(T.freeWord, 'scratch', { dur: 0.35 });
  // how: Live, my request, its question, my answer
  add(T.how - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.bolo + 0.1, 'pop', { gain: 0.8 });
  add(T.asks, 'pop');
  for (let i = 0; i < 5; i++) add(T.answer + i * 0.14, 'tick', { gain: 0.45 });
  // the feedback: two meters fill up
  add(T.tone, 'pop', { gain: 0.8 });
  add(T.clarity, 'pop', { gain: 0.9 });
  add(T.sudhar + 0.2, 'ding', { gain: 0.8 });
  // the follow line
  add(T.follow - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.follow + 0.05, 'thud', { gain: 0.7 });
  add(T.fpress, 'tick', { gain: 1.3 });
  // the twist: the page, the job description, new questions
  add(T.jugaad, 'pop');
  add(T.jd - 0.25, 'swipe');
  add(T.jd + 0.3, 'scratch', { dur: 0.35 });
  add(T.job2 - 0.3, 'whoosh', { dur: 0.35, gain: 0.7 });
  add(T.job2, 'paper');
  for (let i = 0; i < 3; i++) add(T.job2 + 0.3 + i * 0.28, 'pop', { gain: 0.6 + i * 0.1 });
  // the interview again
  add(T.end - 0.26, 'whoosh', { dur: 0.45, gain: 0.8 });
  add(T.same, 'pop', { gain: 0.8 });
  add(T.smileWord, 'ding');
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
