// Napkin AI, the story reel. Cue times and sound effects come from vo.json, so that picture
// and sound use the same numbers.
import { spans, wordTimes } from '../../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const sp = spans(vo);
  // Q: the fifteen sentences in order, each with its word times
  const Q = vo.lines.flatMap((l) => sp[l.id].s.map((s) => ({ ...s, words: wordTimes(s) })));
  const w = (i, n) => Q[i].words[n].t;
  const T = {
    night: w(0, 5),                                   // "रात"
    room: Q[1].a, click: w(1, 4),                     // "click"
    desk: Q[2].a,
    tomorrow: Q[3].a, pres: w(3, 2),                  // "presentation"
    slide: Q[4].a, text: w(4, 5),                     // "text"
    napkin: Q[5].a, name: w(5, 2),                    // "Napkin"
    paste: Q[6].a, drop: w(6, 3),                     // "paste"
    button: Q[7].a, press: w(7, 4),                   // "दबाओ"
    magic: Q[8].a, diagram: w(8, 5),                  // "diagram"
    twist: Q[9].a, now: w(9, 3),                      // "अब"
    design: Q[10].a, colour: w(10, 2), self: w(10, 4),
    png: Q[11].a, free: w(11, 4),                     // "free"
    next: Q[12].a, who: w(12, 4),                     // "यह किसने बनाया?"
    smile: Q[13].a, grin: w(13, 2),                   // "मुस्कुरा"
    ask: Q[14].a, send: w(14, 5),                     // "भेज"
  };
  T.end = Q[14].b;
  T.follow = T.end + 0.3;   // the Follow button is pressed
  T.recap = T.follow;
  const dur = T.end + 1.2;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  add(0.05, 'thud');
  add(T.night, 'pop');
  add(T.room - 0.28, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.click, 'stamp');
  add(T.click + 0.08, 'tick', { gain: 1.3 });
  add(T.desk - 0.2, 'whoosh', { dur: 0.45, gain: 0.8 });
  add(T.tomorrow, 'pop');
  add(T.pres, 'scratch', { dur: 0.4 });
  add(T.slide - 0.26, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.text, 'thud', { gain: 0.8 });
  add(T.napkin - 0.12, 'swipe');
  add(T.napkin + 0.4, 'whoosh', { dur: 0.5, gain: 0.8 });
  add(T.name + 0.35, 'scratch', { dur: 0.4 });
  add(T.paste - 0.25, 'swipe', { gain: 0.7 });
  add(T.drop, 'paper');
  add(T.button - 0.18, 'swipe', { gain: 0.7 });
  add(T.press, 'tick', { gain: 1.4 });
  add(T.press + 0.05, 'pop');
  add(T.magic - 0.05, 'whoosh', { dur: 0.45, gain: 0.8 });
  add(T.diagram, 'ding');
  add(T.twist - 0.1, 'swipe');
  add(T.now, 'pop');
  add(T.design - 0.28, 'swipe');
  add(T.colour, 'swipe', { gain: 0.6 });
  add(T.self, 'swipe', { gain: 0.6 });
  add(T.png - 0.2, 'whoosh', { dur: 0.4, gain: 0.8 });
  add(T.free - 0.1, 'scratch', { dur: 0.4 });
  add(T.next - 0.1, 'swipe');
  add(T.who, 'pop');
  add(T.grin, 'pop');
  add(T.ask + 0.3, 'whoosh', { dur: 0.5, gain: 0.7 });
  add(T.send, 'thud', { gain: 0.8 });
  add(T.follow, 'tick', { gain: 1.4 });
  add(T.follow + 0.06, 'ding');

  return { beat, dur, Q, T, sfx, full: true };
}
