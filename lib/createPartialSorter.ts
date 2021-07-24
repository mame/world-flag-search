export default (
  items: { score: number }[]
): ((start: number, length: number) => void) => {
  const swap = (i: number, j: number): void => {
    const entry = items[i];
    items[i] = items[j];
    items[j] = entry;
  };

  const upheap = (ci: number, start: number): void => {
    while (ci > start) {
      const pi = Math.floor((ci - start - 1) / 2) + start;
      if (items[pi].score <= items[ci].score) break;
      swap(ci, pi);
      ci = pi;
    }
  };

  const downheap = (end: number, start: number): void => {
    let pi = start;
    while (pi < Math.floor((end - start) / 2) + start) {
      let ci = (pi - start) * 2 + 1 + start;
      if (ci < end - 1 && items[ci].score > items[ci + 1].score) ci++;
      if (items[ci].score > items[pi].score) break;
      swap(ci, pi);
      pi = ci;
    }
  };

  return (start, length) => {
    let i = start + 1;
    for (; i < start + length; i++) upheap(i, start);
    for (; i < items.length; i++) {
      if (items[i].score > items[start].score) {
        swap(start, i);
        downheap(start + length, start);
      }
    }
    for (i = start + length - 1; i > start; i--) {
      swap(start, i);
      downheap(i, start);
    }
  };
};
