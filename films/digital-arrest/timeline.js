// #08, "Police video call पर arrest नहीं करती". Cue times and sound effects come from vo.json.
import { spans, wordTimes } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const sp = spans(vo);
  // Q: the thirteen sentences in order, each with its word times
  const Q = vo.lines.flatMap((l) => sp[l.id].s.map((s) => ({ ...s, words: wordTimes(s) })));
  const w = (i, n) => Q[i].words[n].t;
  const T = {
    lakh: w(0, 1), cut: w(1, 3),                         // "दस लाख", "काट दिया"
    call: Q[2].a,                                        // "एक video call आया था"
    man: Q[3].a, parcel: w(3, 6), drugs: w(3, 8),        // "parcel में drugs"
    arrest: Q[4].a, stamp: w(4, 2), camera: w(4, 5),     // "digital arrest", "camera बंद मत करना"
    fear: Q[5].a, wants: Q[6].a,                         // "मम्मी डर गईं", "वो यही चाहता था"
    truth: Q[7].a,                                       // "लेकिन सच यह है"
    police: Q[8].a, cbi: w(8, 1), agency: w(8, 5), video: w(8, 6), never: w(8, 9),
    steps: Q[9].a, hang: Q[10].a, money: w(10, 2), dial: w(10, 6),
    saved: Q[11].a, safe: w(11, 4),                      // "बच गए"
    ask: Q[12].a, send: w(12, 5),                        // "भेजो"
  };
  T.last = Q[12].b;
  T.follow = T.last + 0.3;
  T.recap = T.follow;
  const dur = T.last + 1.2;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  add(0.05, 'thud');
  add(T.lakh, 'pop');
  add(T.cut, 'stamp');
  add(T.call - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.call + 0.1, 'ding', { gain: 0.7 });
  add(T.parcel, 'pop');
  add(T.drugs, 'pop');
  add(T.stamp, 'stamp');
  add(T.camera, 'tick', { gain: 1.2 });
  add(T.fear - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.fear + 0.3, 'thud', { gain: 0.8 });
  add(T.wants - 0.2, 'swipe');
  add(T.truth - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.police, 'pop');
  add(T.cbi, 'pop');
  add(T.agency, 'pop');
  add(T.video - 0.2, 'swipe');
  add(T.never, 'scratch', { dur: 0.4 });
  add(T.never + 0.3, 'stamp');
  add(T.steps - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.hang, 'thud');
  add(T.money, 'thud');
  add(T.dial, 'thud');
  add(T.dial + 0.5, 'ding');
  add(T.saved - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.safe, 'pop');
  add(T.ask + 0.3, 'whoosh', { dur: 0.5, gain: 0.7 });
  add(T.send + 0.25, 'thud', { gain: 0.8 });
  add(T.follow, 'tick', { gain: 1.4 });
  add(T.follow + 0.06, 'ding');

  return { beat, dur, Q, T, sfx, full: true };
}
