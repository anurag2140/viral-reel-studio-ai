// #21, E8 Personal proof (first try): "B.Com किया, coding नहीं आती, फिर भी मेरा app 500+ phones
// में है" (BillBanao on Google Play). Told by me. Cue times and sound effects come from vo.json.
import { spans, wordTimes } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const sp = spans(vo);
  // Q: the twelve sentences in order, each with its word times. The asks are only at the ending:
  // the spoken follow line with the card pressed (my request of 2026-10-23 for this reel), then
  // the send line.
  const Q = vo.lines.flatMap((l) => sp[l.id].s.map((s) => ({ ...s, words: wordTimes(s) })));
  const at = (i, needle, k = 0) => (Q[i].words.filter((w) => w.word.includes(needle))[k] ?? { t: Q[i].a }).t;
  const T = {
    bcom: at(0, 'B.Com'), coding: at(0, 'coding'), nahi: at(0, 'नहीं'),
    phir: Q[1].a, five: at(1, '500'), phones: at(1, 'phones'),
    trouble: Q[2].a, engineers: at(2, 'engineers'), kaam: at(2, 'काम'),
    turn: Q[3].a, ai: at(3, 'AI'), code: at(3, 'code'), likhta: at(3, 'लिखता'),
    how: Q[4].a, tum: at(4, 'तुम'),
    steps: Q[5].a, problem: at(5, 'problem'), tools: at(5, 'tools'), jod: at(5, 'जोड़कर'),
    magic: Q[6].a, bb: at(6, 'BillBanao'),
    shop: Q[7].a, gst: at(7, 'GST'), pdf: at(7, 'PDF'), wa: at(7, 'WhatsApp'),
    vibe: Q[8].a, vibeWord: at(8, 'vibe'),
    end: Q[9].a, interest: at(9, 'interest'), dikhata: at(9, 'दिखाता'),
    fol: Q[10].a, followWord: at(10, 'follow'),
    send: Q[11].a, darta: at(11, 'डरता'), sendWord: at(11, 'भेज'),
  };
  T.lastWord = Q[11].b;
  T.press = T.followWord + 0.35; // the Follow button on the card, pressed as the voice says it
  const dur = T.lastWord + 1.2;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  // the hook: B.Com, no coding, and yet 500+
  add(0.05, 'thud');
  add(T.bcom, 'pop');
  add(T.nahi, 'scratch', { dur: 0.3 });
  add(T.five, 'ding');
  // engineers only: the door shuts
  add(T.trouble - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.engineers, 'thud', { gain: 0.9 });
  // my room at night: I type, the AI writes code, the app appears
  add(T.turn - 0.26, 'whoosh', { dur: 0.4, gain: 0.7 });
  for (let i = 0; i < 4; i++) add(T.turn + 0.3 + i * 0.12, 'tick', { gain: 0.5 });
  for (let i = 0; i < 5; i++) add(T.code + i * 0.14, 'tick', { gain: 0.6 });
  add(T.likhta + 0.2, 'ding', { gain: 0.8 });
  // three steps, three cards
  add(T.how - 0.26, 'whoosh', { dur: 0.4, gain: 0.7 });
  add(T.tum, 'pop');
  add(T.problem, 'paper');
  add(T.tools, 'paper');
  add(T.jod, 'paper');
  // the real page, then the shop: bill, PDF, WhatsApp
  add(T.magic - 0.25, 'swipe');
  add(T.bb, 'scratch', { dur: 0.35 });
  add(T.shop - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.gst, 'pop');
  add(T.pdf, 'pop', { gain: 0.8 });
  add(T.wa - 0.1, 'whoosh', { dur: 0.35, gain: 0.6 });
  add(T.wa + 0.25, 'tick', { gain: 1.1 });
  // "vibe coding": the stamp
  add(T.vibe - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.vibeWord, 'thud');
  add(T.vibeWord + 0.15, 'ding', { gain: 0.8 });
  // back to the start: what I do here, the follow card pressed, the send
  add(T.end - 0.26, 'whoosh', { dur: 0.45, gain: 0.8 });
  add(T.interest, 'pop');
  add(T.dikhata, 'pop', { gain: 0.7 });
  add(T.fol + 0.05, 'thud', { gain: 0.7 });
  add(T.press, 'tick', { gain: 1.4 });
  add(T.press + 0.06, 'ding');
  add(T.send + 0.2, 'whoosh', { dur: 0.5, gain: 0.7 });
  add(T.sendWord + 0.2, 'thud', { gain: 0.8 });

  return { beat, dur, Q, T, sfx, full: true };
}
