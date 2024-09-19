export const convertToRange = (array) => {
  const ranges = []; let rangeStart; let
    rangeEnd;
  for (let i = 0; i < array.length; i += 1) {
    rangeStart = array[i];
    rangeEnd = rangeStart;
    while (array[i + 1] - array[i] === 1) {
      rangeEnd = array[i + 1]; // increment the index if the numbers sequential
      i += 1;
    }
    ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart }-${ rangeEnd}`);
  }
  return ranges;
};
