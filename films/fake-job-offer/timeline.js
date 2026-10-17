// #13, "पचास applications के बाद offer आया, और वो तुम्हें लूटने आया था" (the fake job offer, a
// sequel to #11). Cue times and sound effects come from vo.json.
import { spans, wordTimes } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const sp = spans(vo);
  // Q: the seventeen sentences in order, each with its word times
  const Q = vo.lines.flatMap((l) => sp[l.id].s.map((s) => ({ ...s, words: wordTimes(s) })));
  const at = (i, needle, k = 0) => (Q[i].words.filter((w) => w.word.includes(needle))[k] ?? { t: Q[i].a }).t;
  const T = {
    loot: at(0, 'लूटने'),
    wa: Q[1].a, hr: at(1, 'HR'),
    nointerview: Q[2].a, offer: at(2, 'offer'),
    fee: Q[3].a, five: at(3, 'पाँच'), training: at(3, 'training'),
    pay: Q[4].a, payWord: at(4, 'pay'),
    but: Q[5].a, site: at(5, 'website'),
    how: Q[6].a, name: at(6, 'नाम'),
    when: Q[7].a, kab: at(7, 'कब'),
    old: Q[8].a, years: at(8, 'सालों'),
    this: Q[9].a,
    six: at(10, 'छह'),
    never: Q[11].a, money: at(11, 'पैसे'),
    nopay: Q[12].a, nahi: at(12, 'नहीं'),
    off: Q[13].a, band: at(13, 'बंद'),
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
  add(0.3, 'tick', { gain: 0.6 });
  add(T.loot, 'stamp');
  add(T.wa - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.wa + 0.1, 'ding', { gain: 0.7 });
  add(T.nointerview + 0.05, 'pop');
  add(T.offer, 'ding', { gain: 0.7 });
  add(T.offer + 0.3, 'paper', { gain: 0.6 });
  add(T.fee + 0.05, 'ding', { gain: 0.7 });
  add(T.five, 'scratch', { dur: 0.35 });
  add(T.pay - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.payWord, 'pop', { gain: 0.8 });
  add(T.but, 'thud', { gain: 0.8 });
  add(T.site, 'scratch', { dur: 0.4 });
  add(T.how - 0.3, 'swipe');
  add(T.name, 'scratch', { dur: 0.35 });
  add(T.name + 0.6, 'tick', { gain: 0.9 });
  add(T.when - 0.2, 'swipe', { gain: 0.8 });
  add(T.kab, 'scratch', { dur: 0.3 });
  add(T.years, 'scratch', { dur: 0.4 });
  add(T.years + 0.35, 'pop');
  add(T.this - 0.12, 'swipe');
  for (let i = 0; i < 5; i++) add(T.this + 0.15 + i * 0.12, 'tick', { gain: 0.5 });
  add(T.six, 'stamp');
  add(T.six + 0.35, 'pop', { gain: 0.8 });
  add(T.never - 0.1, 'swipe', { gain: 0.7 });
  add(T.never + 0.35, 'pop', { gain: 0.8 });
  add(T.money, 'stamp');
  add(T.nopay - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.nahi, 'paper');
  add(T.nahi + 0.1, 'paper', { gain: 0.7 });
  add(T.off + 0.1, 'swipe', { gain: 0.6 });
  add(T.band, 'thud', { gain: 0.9 });
  add(T.link + 0.12, 'pop');
  add(T.comment - 0.08, 'swipe', { gain: 0.7 });
  for (let i = 0; i < 4; i++) add(T.comment + 0.25 + i * 0.1, 'tick', { gain: 0.6 });
  add(T.post, 'tick', { gain: 1.3 });
  add(T.ask + 0.1, 'whoosh', { dur: 0.5, gain: 0.7 });
  add(T.send + 0.25, 'pop', { gain: 0.9 });
  add(T.follow, 'tick', { gain: 1.4 });
  add(T.follow + 0.06, 'ding');

  return { beat, dur, Q, T, sfx, full: true };
}
