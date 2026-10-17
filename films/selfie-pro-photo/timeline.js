// #12, AI जुगाड़ #1: "तुम्हारी hostel वाली selfie अब LinkedIn वाली professional photo है".
// Cue times and sound effects come from vo.json.
import { spans, wordTimes } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const sp = spans(vo);
  // Q: the eighteen sentences in order, each with its word times
  const Q = vo.lines.flatMap((l) => sp[l.id].s.map((s) => ({ ...s, words: wordTimes(s) })));
  const at = (i, needle, k = 0) => (Q[i].words.filter((w) => w.word.includes(needle))[k] ?? { t: Q[i].a }).t;
  const T = {
    linked: at(0, 'LinkedIn'), pro: at(0, 'professional'),
    noPhoto: at(1, 'photographer'), noBlazer: at(1, 'blazer'),
    trouble: Q[2].a, form: at(2, 'form'),
    formal: Q[3].a, phone: at(3, 'phone'), selfies: at(3, 'selfies'),
    turn: Q[4].a, rohan: at(4, 'Rohan'), gemini: at(4, 'Gemini'),
    free: Q[5].a, freeWord: at(5, 'free'),
    upload: Q[6].a, uploadWord: at(6, 'upload'),
    line: Q[7].a, lineWord: at(7, 'line'),
    magic: Q[8].a, face: at(8, 'चेहरा'), blazer: at(8, 'blazer'), light: at(8, 'light'),
    follow: Q[9].a, followWord: at(9, 'follow'),
    twist: Q[10].a,
    sizes: Q[11].a, size: at(11, 'size'),
    end: Q[12].a, photoQ: at(12, 'photo'), asked: at(12, 'पूछा'),
    smile: Q[13].a, jugaad: at(13, 'जुगाड़'),
    link: Q[14].a, comment: Q[15].a, post: Q[15].b - 0.08,
    prompt: Q[16].a, send: Q[17].a, sendWord: at(17, 'भेज'),
  };
  T.last = Q[17].b;
  T.press = T.last + 0.3; // the Follow button on the card at the very end
  T.recap = T.press;
  const dur = T.last + 1.2;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  // the hook: the photo is already up; sparkles, then two crosses
  add(0.05, 'thud');
  add(T.pro, 'ding', { gain: 0.8 });
  add(T.noPhoto, 'scratch', { dur: 0.3 });
  add(T.noBlazer, 'scratch', { dur: 0.3 });
  // the trouble: the form, the selfies fan out and are crossed
  add(T.trouble - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.form, 'paper');
  for (let i = 0; i < 3; i++) add(T.phone + 0.1 + i * 0.16, 'pop', { gain: 0.7 });
  for (let i = 0; i < 3; i++) add(T.selfies + i * 0.14, 'scratch', { dur: 0.22, gain: 0.7 });
  // Rohan, the pages
  add(T.turn + 0.05, 'pop');
  add(T.gemini - 0.3, 'swipe');
  add(T.gemini + 0.1, 'scratch', { dur: 0.35 });
  add(T.free - 0.2, 'swipe', { gain: 0.8 });
  add(T.freeWord, 'scratch', { dur: 0.35 });
  add(T.freeWord + 0.45, 'scratch', { dur: 0.3 });
  // the chat: the selfie goes in, the line is typed, sent
  add(T.upload - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.uploadWord, 'paper');
  for (let i = 0; i < 7; i++) add(T.lineWord + 0.1 + i * 0.12, 'tick', { gain: 0.55 });
  add(T.magic - 0.32, 'tick', { gain: 1.2 });
  // the magic: blazer, then light
  add(T.magic - 0.1, 'whoosh', { dur: 0.35, gain: 0.6 });
  add(T.blazer, 'pop');
  add(T.light, 'ding');
  // the follow line
  add(T.follow + 0.05, 'thud', { gain: 0.7 });
  add(T.followWord + 0.2, 'tick', { gain: 1.3 });
  // the twist: the page, then three sizes
  add(T.twist - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.twist + 0.4, 'pop');
  add(T.sizes - 0.2, 'swipe');
  add(T.sizes + 0.35, 'scratch', { dur: 0.35 });
  for (let i = 0; i < 3; i++) add(T.sizes + 1.45 + i * 0.2, 'pop', { gain: 0.7 + i * 0.15 });
  // the interview
  add(T.end - 0.26, 'whoosh', { dur: 0.45, gain: 0.8 });
  add(T.photoQ, 'pop', { gain: 0.8 });
  add(T.jugaad, 'ding');
  // the link line and the ask
  add(T.link + 0.12, 'pop');
  add(T.comment - 0.08, 'swipe', { gain: 0.7 });
  for (let i = 0; i < 4; i++) add(T.comment + 0.25 + i * 0.1, 'tick', { gain: 0.6 });
  add(T.post, 'tick', { gain: 1.3 });
  add(T.prompt + 0.1, 'paper');
  add(T.send + 0.3, 'whoosh', { dur: 0.5, gain: 0.7 });
  add(T.sendWord + 0.25, 'thud', { gain: 0.8 });
  add(T.press, 'tick', { gain: 1.4 });
  add(T.press + 0.06, 'ding');

  return { beat, dur, Q, T, sfx, full: true };
}
