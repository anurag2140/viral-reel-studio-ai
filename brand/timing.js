// Voice timing helpers, shared by picture (browser) and sound (node).

// Start time of each word, spread over the sentence span by word length.
export function wordTimes(s) {
  const words = s.text.split(' ');
  const w = words.map((x) => x.length + 1);
  const total = w.reduce((a, b) => a + b, 0);
  let acc = 0;
  return words.map((word, i) => {
    const t = s.a + ((s.b - s.a) * acc) / total;
    acc += w[i];
    return { word, t };
  });
}

export const wordAt = (s, needle) => (wordTimes(s).find((x) => x.word.includes(needle)) ?? { t: s.a }).t;

// Sentence spans per voice line: the longest internal pauses are the sentence breaks.
export function spans(vo) {
  const L = {};
  for (const l of vo.lines) {
    const n = l.sentences.length;
    const chars = l.sentences.reduce((a, s) => a + s.length, 0);
    // A sentence break is a long pause near the place where the text says it should be.
    // (Only "the longest pause" is not enough: in #07 a pause at a comma was longer than
    // the pause at the full stop, and two sentences got the wrong times.)
    const cuts = [];
    let seen = 0;
    for (let i = 0; i < n - 1; i++) {
      seen += l.sentences[i].length;
      const expect = (l.duration * seen) / chars;
      const from = cuts.length ? cuts[cuts.length - 1][1] : 0;
      const best = l.pauses.filter((p) => p[0] > from)
        .sort((x, y) => (y[1] - y[0] - 0.35 * Math.abs((y[0] + y[1]) / 2 - expect)) - (x[1] - x[0] - 0.35 * Math.abs((x[0] + x[1]) / 2 - expect)))[0];
      if (best) cuts.push(best);
    }
    const even = cuts.length !== n - 1;
    let a = 0;
    let acc = 0;
    const s = l.sentences.map((text, i) => {
      acc += text.length;
      const b = i === n - 1 ? l.duration : even ? (l.duration * acc) / chars : cuts[i][0];
      const o = { a: l.start + a, b: l.start + b, text };
      a = i === n - 1 || even ? b : cuts[i][1];
      return o;
    });
    L[l.id] = { start: l.start, end: l.start + l.duration, s };
  }
  return L;
}

// Split a one-sentence line at its first pause into two timed halves (text split after the comma).
export function halves(vo, id, span) {
  const line = vo.lines.find((l) => l.id === id);
  const [head, tail] = span.text.split(/(?<=,) /);
  if (!line.pauses.length || !tail) return [span, span];
  const [p0, p1] = line.pauses[0];
  return [{ a: span.a, b: line.start + p0, text: head }, { a: line.start + p1, b: span.b, text: tail }];
}