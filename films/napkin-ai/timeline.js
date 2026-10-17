// Reel #06, lane TOOL: Napkin AI turns text into diagrams. Cue times and SFX, all from vo.json.
// This is the reference reel for the format: hook, steps on the real web page, last line, follow tag.
import { spans, wordAt } from '../../brand/timing.js';

export function build(vo) {
  const beat = 60 / vo.bpm;
  const half = beat / 2;
  const L = spans(vo);
  const H = L.hook.s;
  const A = L.s1.s;
  const B = L.s2.s;
  const C = L.s3.s;
  const Z = L.pay.s[0];

  const tag = Z.b + 0.15;
  const T = {
    // hook: the phone waits low under the big text, then rises when the tool is named
    mark0: 0.45,
    rise: H[1].a - 0.25,
    name: wordAt(H[1], 'Napkin'),
    // step 1: paste your text, no prompt needed
    s1: A[0].a,
    noPrompt: wordAt(A[1], 'नहीं'),
    // step 2: press one button, pick a visual
    s2: B[0].a,
    click: wordAt(B[0], 'दबाओ'),
    pick: wordAt(B[1], 'चुनो'),
    // step 3: export as PNG or PDF, on the free plan too
    s3: C[0].a,
    files: ['PNG', 'PDF'].map((w) => wordAt(C[0], w)),
    free: wordAt(C[1], 'free'),
    // last line, then the follow tag
    pay: Z.a,
    no: wordAt(Z, 'नहीं'),
    yes: wordAt(Z, 'diagram'),
    tag,
  };
  T.press = Math.ceil((tag + 0.8) / half) * half; // the button is pressed on the half-beat grid
  T.recap = T.press;
  const dur = T.press + 0.65;

  const sfx = [];
  const add = (t, type, o = {}) => sfx.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  add(0.06, 'thud');
  add(T.mark0, 'scratch', { dur: 0.3 });
  add(T.rise, 'whoosh', { dur: 0.45, gain: 0.7 });
  add(T.name, 'pop');
  [T.s1, T.s2, T.s3, T.pay].forEach((t) => add(t - 0.45, 'whoosh', { dur: 0.55, gain: 0.7 }));
  [T.s1, T.s2, T.s3].forEach((t) => { add(t + 0.15, 'pop', { gain: 0.8 }); add(t + 0.2, 'scratch', { dur: 0.3 }); });
  add(T.noPrompt, 'swipe');
  add(T.click, 'stamp');
  add(T.pick, 'ding', { gain: 0.5 });
  T.files.forEach((t) => add(t, 'paper'));
  add(T.free, 'stamp', { gain: 0.8 });
  add(T.no, 'swipe');
  add(T.yes, 'pop');
  add(T.tag + 0.26, 'paper');
  add(T.tag + 0.36, 'paper', { gain: 0.8 });
  add(T.press, 'stamp');
  add(T.recap, 'ding');

  return { beat, dur, L, T, sfx, full: true };
}
