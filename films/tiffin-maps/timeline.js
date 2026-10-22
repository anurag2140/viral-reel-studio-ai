// #20, AI से कमाई #2: "Aunty का tiffin Google Maps पर आया, और पहली कमाई तुम्हारी हुई" (Google
// Business Profile, Gemini, Ask Maps). The second money reel (T4). Cue times and sound effects
// come from vo.json.
import { spans, wordTimes } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const sp = spans(vo);
  // Q: the eleven sentences in order, each with its word times. No follow line in the middle
  // (my request of 2026-10-23: it broke the flow of the story); the follow card is only at the end.
  const Q = vo.lines.flatMap((l) => sp[l.id].s.map((s) => ({ ...s, words: wordTimes(s) })));
  const at = (i, needle, k = 0) => (Q[i].words.filter((w) => w.word.includes(needle))[k] ?? { t: Q[i].a }).t;
  const T = {
    maps: at(0, 'Maps'), kamai: at(0, 'कमाई'),
    trouble: Q[1].a, famous: at(1, 'famous'), maps2: at(1, 'Maps'), nahi: at(1, 'नहीं'),
    turn: Q[2].a, free: at(2, 'free'), profile: at(2, 'Profile'),
    how: Q[3].a, photos: at(3, 'photos'), reviews: at(3, 'reviews'), gemini: at(3, 'Gemini'),
    magic: Q[4].a, orders: at(4, 'orders'), paise: at(4, 'पैसे'),
    twist: Q[5].a, ai: at(5, 'AI'), khana: at(5, 'खाना'), kahan: at(5, 'कहाँ'),
    notOn: Q[6].a, jawab: at(6, 'जवाब'),
    catch: Q[7].a, din: at(7, 'दिन'), free2: at(7, 'free'), mehnat: at(7, 'मेहनत'),
    link: Q[8].a, comment: Q[9].a, post: Q[9].b - 0.08,
    send: Q[10].a, sendWord: at(10, 'भेजो'),
  };
  T.lastWord = Q[10].b;
  T.press = T.lastWord + 0.3; // the Follow button on the card at the very end
  const dur = T.lastWord + 1.2;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  // the hook: the pin lands, "पहली कमाई"
  add(0.05, 'thud');
  add(T.maps, 'pop');
  add(T.kamai, 'ding');
  // famous food, then the map with no pin for her
  add(T.famous, 'pop', { gain: 0.7 });
  add(T.maps2 - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  for (let i = 0; i < 3; i++) add(T.maps2 + 0.05 + i * 0.16, 'pop', { gain: 0.5 + i * 0.1 });
  add(T.nahi, 'scratch', { dur: 0.3 });
  // the Business Profile page
  add(T.turn - 0.25, 'swipe');
  add(T.free, 'scratch', { dur: 0.35 });
  // the profile fills up, then Gemini's page
  add(T.how - 0.26, 'whoosh', { dur: 0.4, gain: 0.7 });
  add(T.how + 0.05, 'tick');
  for (let i = 0; i < 4; i++) add(T.photos + i * 0.14, 'pop', { gain: 0.5 + i * 0.08 });
  add(T.reviews - 0.25, 'swipe', { gain: 0.8 });
  add(T.gemini, 'scratch', { dur: 0.35 });
  // orders come in, she pays
  add(T.magic - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  for (let i = 0; i < 3; i++) add(T.orders + i * 0.22, 'tick', { gain: 0.9 });
  add(T.paise, 'pop');
  add(T.paise + 0.3, 'ding', { gain: 0.8 });
  // Ask Maps: the page, the question, her pin in the answer, the shop that is not there
  add(T.twist - 0.25, 'swipe');
  add(T.ai, 'scratch', { dur: 0.35 });
  add(T.khana - 0.26, 'whoosh', { dur: 0.4, gain: 0.7 });
  add(T.kahan + 0.2, 'ding', { gain: 0.8 });
  add(T.jawab, 'thud', { gain: 0.8 });
  // the honest catch: days go by, free, your work
  add(T.catch - 0.26, 'whoosh', { dur: 0.4, gain: 0.7 });
  for (let i = 0; i < 4; i++) add(T.din - 0.1 + i * 0.22, 'paper', { gain: 0.6 });
  add(T.free2, 'pop');
  add(T.mehnat, 'ding', { gain: 0.8 });
  // back at the counter: the link line, Gupta Ji, the ask
  add(T.link - 0.26, 'whoosh', { dur: 0.45, gain: 0.8 });
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
