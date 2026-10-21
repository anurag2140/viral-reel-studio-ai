// #18, SCAM: "Video like करने के पैसे मिले, और फिर सारे पैसे डूब गए" (the Telegram task scam).
// Cue times and sound effects come from vo.json.
import { spans, wordTimes } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const sp = spans(vo);
  // Q: the sixteen sentences in order, each with its word times
  const Q = vo.lines.flatMap((l) => sp[l.id].s.map((s) => ({ ...s, words: wordTimes(s) })));
  const at = (i, needle, k = 0) => (Q[i].words.filter((w) => w.word.includes(needle))[k] ?? { t: Q[i].a }).t;
  const T = {
    dube: at(0, 'डूब'), sach: Q[1].a,
    trouble: Q[2].a, tg: at(2, 'Telegram'), likeKaro: at(2, 'like'), pachas: at(2, 'पचास'),
    teen: Q[3].a, likes: at(3, 'like'), dedh: at(3, 'डेढ़'),
    turn: Q[4].a, vip: at(4, 'VIP'), sab: at(4, 'सब'), mujhe: at(4, 'मुझे'),
    task: Q[5].a, hazaar: at(5, 'हज़ार'), terah: at(5, 'तेरह'),
    bhejte: Q[6].a, adhoora: at(6, 'अधूरा'), paanch: at(6, 'पाँच'),
    gayab: Q[7].a, gayabW: at(7, 'ग़ायब'),
    bait: Q[8].a, chaara: at(8, 'चारा'), chuha: at(8, 'चूहा'),
    rule: Q[9].a, nahin: at(9, 'नहीं'), scam: at(9, 'scam'),
    twist: Q[10].a, n1930: at(10, '1930'), portal: at(10, 'cybercrime'), complaint: at(10, 'complaint'),
    jaldi: Q[11].a, rukne: at(11, 'रुकने'),
    end: Q[12].a, wahi: at(12, 'वही'), block: at(12, 'block'),
    link: Q[13].a, comment: Q[14].a, post: Q[14].b - 0.08,
    send: Q[15].a, sendWord: at(15, 'भेजो'),
  };
  T.last = Q[15].b;
  T.press = T.last + 0.3; // the Follow button on the card at the very end
  T.pay = T.bhejte - 0.15; // Chintu presses PAY
  T.snap = T.chaara + 0.25; // the mousetrap shuts
  const dur = T.last + 1.2;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  // the hook: the empty wallet, the moth, the rewind
  add(0.05, 'thud');
  add(T.dube, 'swipe', { gain: 0.7 });
  add(T.sach - 0.05, 'whoosh', { dur: 0.5, gain: 0.7 });
  for (let i = 0; i < 4; i++) add(T.sach + 0.1 + i * 0.12, 'tick', { gain: 0.5 });
  // the phone: the message, three likes, the money comes
  add(T.trouble - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.tg, 'ding', { gain: 0.7 });
  add(T.likeKaro, 'pop', { gain: 0.6 });
  for (let i = 0; i < 3; i++) add(T.likes - 0.1 + i * 0.28, 'pop', { gain: 0.7 + i * 0.1 });
  add(T.dedh, 'ding');
  // the VIP group: Mitthu everywhere
  add(T.turn, 'pop');
  for (let i = 0; i < 4; i++) add(T.sab + i * 0.3, 'pop', { gain: 0.55 + i * 0.08 });
  add(T.mujhe + 0.1, 'scratch', { dur: 0.3, gain: 0.7 });
  // the task, PAY, more, gone
  add(T.task, 'thud', { gain: 0.8 });
  add(T.pay, 'tick', { gain: 1.3 });
  add(T.pay + 0.2, 'ding', { gain: 0.6 });
  add(T.adhoora, 'thud');
  add(T.paanch, 'thud', { gain: 0.9 });
  add(T.gayab, 'whoosh', { dur: 0.5, gain: 0.8 });
  add(T.gayabW, 'thud', { gain: 1.0 });
  // the mousetrap
  add(T.bait - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.snap, 'thud', { gain: 1.1 });
  add(T.snap + 0.04, 'scratch', { dur: 0.2 });
  add(T.chuha, 'pop');
  // the rule: the stamp
  add(T.nahin, 'pop', { gain: 0.6 });
  add(T.scam - 0.1, 'thud', { gain: 1.0 });
  // the portal page
  add(T.twist - 0.26, 'swipe');
  add(T.n1930, 'scratch', { dur: 0.35 });
  add(T.portal, 'scratch', { dur: 0.3, gain: 0.7 });
  add(T.complaint, 'scratch', { dur: 0.35 });
  add(T.jaldi + 0.1, 'pop');
  for (let i = 0; i < 6; i++) add(T.jaldi + 0.3 + i * 0.25, 'tick', { gain: 0.45 });
  // the next day: the same message, block
  add(T.end - 0.26, 'whoosh', { dur: 0.45, gain: 0.8 });
  add(T.wahi - 0.1, 'ding', { gain: 0.6 });
  add(T.block, 'tick', { gain: 1.3 });
  add(T.block + 0.08, 'thud');
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
