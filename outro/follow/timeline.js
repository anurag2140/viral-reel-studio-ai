// Follow outros (up to 10 seconds): a pitch, then the ask. Cue times come from vo.json.
// The variant is the first part of the voice line ids ("journey-pitch", "journey-cta").
import { wordTimes } from '../../brand/timing.js';

// the words each caption highlights, one entry per spoken phrase
export const HL = {
  journey: ['Coding', 'कोई बात नहीं', 'zero से pro', 'एक-एक video', 'follow करो'],
  series: ['शुरुआत', 'आगे', 'ChatGPT', 'prompt', 'AI agents', 'miss न हो', 'follow करो'],
  value: ['मुश्किल', 'एक ही चीज़', 'बिना coding', 'अपनी भाषा', 'follow करो'],
  comment: ['तुम चुनो', 'Comment', 'क्या समझना', 'miss न हो', 'follow कर लो'],
  share: ['दोस्त', 'भेज दो', 'साथ सीखो', 'Zero से pro', 'बिना coding', 'Follow करो'],
};

// Split a voice line into its phrases (at commas and sentence ends) and time each phrase.
// A detected pause is used where it sits near the expected boundary; other boundaries are
// placed by text length between the pauses that were found.
function phrases(line) {
  const texts = line.text.split(/(?<=[,।?!]) /);
  const k = texts.length;
  const len = texts.map((x) => x.length + 1);
  const D = line.duration;
  const chars = (i0, i1) => len.slice(i0, i1).reduce((a, b) => a + b, 0);
  const est = Array.from({ length: k - 1 }, (_, j) => (D * chars(0, j + 1)) / chars(0, k));
  let cut = new Array(k - 1).fill(null);
  for (const p of [...line.pauses].sort((x, y) => y[1] - y[0] - (x[1] - x[0]))) {
    const mid = (p[0] + p[1]) / 2;
    let best = -1;
    for (let j = 0; j < k - 1; j++) if (!cut[j] && (best < 0 || Math.abs(est[j] - mid) < Math.abs(est[best] - mid))) best = j;
    if (best >= 0 && Math.abs(est[best] - mid) < 0.7) cut[best] = p;
  }
  // matched pauses must be in order; if they are not, trust none of them
  const found = cut.filter(Boolean);
  if (found.some((p, i) => i > 0 && p[0] < found[i - 1][1])) cut = cut.map(() => null);
  const start = [0];
  const end = [];
  for (let j = 0; j < k - 1; j++) {
    if (cut[j]) { end.push(cut[j][0]); start.push(cut[j][1]); continue; }
    let l = j - 1;
    while (l >= 0 && !cut[l]) l--;
    let r = j + 1;
    while (r < k - 1 && !cut[r]) r++;
    const tl = l >= 0 ? cut[l][1] : 0;
    const tr = r < k - 1 ? cut[r][0] : D;
    const t = tl + ((tr - tl) * chars(l + 1, j + 1)) / chars(l + 1, r + 1);
    end.push(t);
    start.push(t);
  }
  end.push(D);
  return texts.map((text, i) => {
    const o = { a: line.start + start[i], b: line.start + end[i], text };
    o.words = wordTimes(o);
    return o;
  });
}

// Cues and sound effects of each variant. P = phrases, at(i, word) = time of a word in phrase i.
const CUES = {
  // "Coding नहीं आती? | कोई बात नहीं। | यहाँ AI zero से pro तक सीखो, | एक-एक video में। | … follow करो।"
  journey(T, P, at, add) {
    T.cross = at(0, 'नहीं');
    T.ok = P[1].a;
    const a = P[2].a + 0.25;
    const b = P[3].b - 0.15;
    T.steps = [0, 1, 2, 3].map((k) => a + ((b - a) * k) / 3);
    add(T.cross, 'swipe');
    add(T.ok, 'whoosh', { dur: 0.3, gain: 0.6 });
    add(T.ok + 0.14, 'stamp');
    T.steps.forEach((t) => add(t + 0.22, 'pop', { gain: 0.8 }));
    add(T.steps[3] + 0.3, 'ding', { gain: 0.5 });
  },
  // "ये तो बस शुरुआत है। | आगे सीखोगे, | ChatGPT कैसे सोचता है, | prompt कैसे लिखें, | और AI agents क्या हैं। | कोई video miss न हो, | इसलिए follow करो।"
  series(T, P, at, add) {
    T.next = P[1].a;
    T.reveal = [P[2].a + 0.05, P[3].a + 0.05, at(4, 'AI')];
    T.wiggle = P[5].a + 0.1;
    add(0.14, 'swipe', { dur: 0.2 });
    add(T.next, 'pop');
    T.reveal.forEach((t) => { add(t, 'paper'); add(t + 0.26, 'pop', { gain: 0.8 }); });
    add(T.wiggle, 'tick');
    add(T.wiggle + 0.12, 'tick');
  },
  // "AI मुश्किल लगता है? | यहाँ हर video में एक ही चीज़ समझो, | बिना coding, | अपनी भाषा में। | … follow करो।"
  value(T, P, at, add) {
    T.clean = P[1].a;
    T.one = at(1, 'एक') - 0.05;
    T.happy = T.one + 0.3;
    T.s1 = P[2].a + 0.05;
    T.s2 = P[3].a + 0.05;
    add(0.25, 'tick');
    add(0.55, 'tick');
    add(T.clean, 'whoosh', { dur: 0.35, gain: 0.7 });
    add(T.one + 0.28, 'thud', { gain: 0.8 });
    add(T.happy, 'pop');
    add(T.s1, 'stamp');
    add(T.s2, 'stamp');
  },
  // "अगला AI topic तुम चुनो। | Comment में लिखो, | तुम्हें क्या समझना है। | और वो video miss न हो, | इसलिए follow कर लो।"
  comment(T, P, at, add) {
    T.you = at(0, 'तुम');
    T.box = P[1].a - 0.2;
    T.send = P[2].a + (P[2].b - P[2].a) * 0.55;
    T.type = { a: P[1].a + 0.05, b: T.send - 0.1 };
    T.title = T.send + 0.18;
    add(T.you, 'stamp', { gain: 0.8 });
    add(T.box + 0.28, 'paper');
    for (let i = 0; i < 6; i++) add(T.type.a + ((T.type.b - T.type.a) * i) / 6, 'tick');
    add(T.send, 'pop');
    add(T.title, 'thud', { gain: 0.8 });
    add(T.title + 0.2, 'stamp', { gain: 0.8 });
    add(T.title + 0.32, 'pop', { gain: 0.7 });
    add(T.title + 0.44, 'pop', { gain: 0.7 });
  },
  // "कोई दोस्त AI सीखना चाहता है? | ये video उसे भेज दो, | और दोनों साथ सीखो। | Zero से pro तक, | बिना coding। | Follow करो।"
  share(T, P, at, add) {
    T.hit = at(1, 'भेज');
    T.land = T.hit + 0.45;
    T.together = at(2, 'साथ');
    add(0.3, 'pop', { gain: 0.7 });
    add(T.hit, 'whoosh', { dur: 0.45, gain: 0.8 });
    add(T.land, 'pop');
    add(T.land + 0.05, 'ding', { gain: 0.5 });
    add(T.together, 'pop');
    add(T.together + 0.15, 'pop', { gain: 0.7 });
  },
};

export function build(vo) {
  const beat = 60 / vo.bpm;
  const id = vo.lines[0].id.split('-')[0];
  const P = vo.lines.flatMap(phrases);
  const cta = vo.lines[vo.lines.length - 1];
  const last = P[P.length - 1];
  const at = (i, needle) => (P[i].words.find((w) => w.word.includes(needle)) ?? { t: P[i].a }).t;

  // The button is pressed just after the word "follow".
  const fi = P.findIndex((p) => /ollow/.test(p.text));
  const press = Math.min(at(fi, 'ollow') + 0.3, last.b - 0.02);
  const half = beat / 2;
  const recap = Math.ceil(press / half) * half; // last chord, on the half-beat grid
  const dur = Math.max(last.b + 0.55, recap + 0.7);
  const T = { cta: cta.start, btn: cta.start + 0.12, press, recap };

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  add(0.05, 'thud', { gain: 0.8 });
  CUES[id](T, P, at, add);
  add(T.cta - 0.3, 'whoosh', { dur: 0.45, gain: 0.7 });
  add(T.cta + 0.24, 'paper');
  add(T.cta + 0.2, 'pop', { gain: 0.7 });
  add(T.btn + 0.28, 'paper', { gain: 0.8 });
  add(press, 'stamp');
  add(recap, 'ding');

  return { beat, dur, id, T, P, sfx };
}
