// #11, "पचास जगह apply किया, एक भी call नहीं". Cue times and sound effects come from vo.json.
import { spans, wordTimes } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const sp = spans(vo);
  // Q: the seventeen sentences in order, each with its word times
  const Q = vo.lines.flatMap((l) => sp[l.id].s.map((s) => ({ ...s, words: wordTimes(s) })));
  const at = (i, needle, k = 0) => (Q[i].words.filter((w) => w.word.includes(needle))[k] ?? { t: Q[i].a }).t;
  const T = {
    fifty: at(0, 'पचास'), noCall: at(0, 'call'),
    human: Q[1].a, read: at(1, 'पढ़ा'),
    filter: Q[2].a, software: at(2, 'software'),
    ats: Q[3].a, atsWord: at(3, 'ATS'),
    reject: Q[4].a, rejectWord: at(4, 'reject'),
    turn: Q[5].a, free: at(5, 'free'),
    name: Q[6].a,
    upload: Q[7].a, uploadWord: at(7, 'upload'),
    score: Q[8].a, hundred: at(8, 'सौ'),
    weak: Q[9].a, weakWord: at(9, 'कमज़ोर'), mistake: at(9, 'गलती'),
    trick: Q[10].a,
    again: Q[11].a, reup: at(11, 'upload'), freeAgain: at(11, 'free'),
    climb: Q[12].a,
    call: Q[13].a, interview: at(13, 'interview'),
    link: Q[14].a, comment: Q[15].a, post: Q[15].b - 0.08,
    ask: Q[16].a, send: at(16, 'भेजो'),
  };
  T.last = Q[16].b;
  T.follow = T.last + 0.3;
  T.recap = T.follow;
  const dur = T.last + 1.2;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  add(0.05, 'thud');
  for (let i = 0; i < 3; i++) add(0.15 + i * 0.18, 'tick', { gain: 0.6 });
  add(T.noCall, 'stamp');
  add(T.human - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.read, 'pop', { gain: 0.8 });
  add(T.filter - 0.1, 'swipe');
  for (let i = 0; i < 6; i++) add(T.software + 0.2 + i * 0.32, 'tick', { gain: 0.45 });
  add(T.atsWord, 'stamp');
  for (let i = 0; i < 4; i++) add(T.reject + 0.25 + i * 0.5, 'paper', { gain: 0.6 });
  add(T.rejectWord, 'stamp');
  add(T.turn - 0.26, 'whoosh', { dur: 0.45, gain: 0.8 });
  add(T.free, 'pop');
  add(T.name + 0.2, 'scratch', { dur: 0.4 });
  add(T.uploadWord, 'paper');
  add(T.uploadWord + 0.35, 'thud', { gain: 0.7 });
  add(T.hundred, 'scratch', { dur: 0.35 });
  add(T.weakWord, 'scratch', { dur: 0.3 });
  add(T.mistake, 'scratch', { dur: 0.3 });
  add(T.trick - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.trick + 0.4, 'pop');
  add(T.again - 0.2, 'swipe');
  add(T.reup, 'paper', { gain: 0.7 });
  add(T.freeAgain, 'scratch', { dur: 0.4 });
  for (let i = 0; i < 3; i++) add(T.climb + 0.15 + i * 0.3, 'pop', { gain: 0.7 + i * 0.15 });
  add(T.call - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  for (let i = 0; i < 4; i++) add(T.call + 0.1 + i * 0.22, 'tick', { gain: 0.9 });
  add(T.interview, 'ding');
  add(T.link + 0.12, 'pop');
  add(T.comment - 0.08, 'swipe', { gain: 0.7 });
  for (let i = 0; i < 4; i++) add(T.comment + 0.25 + i * 0.1, 'tick', { gain: 0.6 });
  add(T.post, 'tick', { gain: 1.3 });
  add(T.ask + 0.3, 'whoosh', { dur: 0.5, gain: 0.7 });
  add(T.send + 0.25, 'thud', { gain: 0.8 });
  add(T.follow, 'tick', { gain: 1.4 });
  add(T.follow + 0.06, 'ding');

  return { beat, dur, Q, T, sfx, full: true };
}
