function getResultArr(wins: number, draws: number, losses: number): string[] {
  return [
    ...Array(wins).fill('win'),
    ...Array(losses).fill('loss'),
    ...Array(draws).fill('draw'),
  ];
}

export function compare(
  a: number | string,
  b: number | string,
  isAsc: boolean
) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

export function median(values: number[]) {
  if (values.length === 0) throw new Error('No inputs');

  values.sort((a, b) => a - b);

  const half = Math.floor(values.length / 2);

  if (values.length % 2) return values[half];

  return (values[half - 1] + values[half]) / 2.0;
}

export function shuffle<T>(arr: T[]) {
  const array = arr;
  let currentIndex = array.length;
  let randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export function getRandomInt(mn: number, mx: number): number {
  // let seed = xmur3("string-seed");
  // let rand = mulberry32(seed());
  const min = Math.ceil(mn);
  const max = Math.floor(mx);

  return Math.floor(Math.random() * (max - min + 1) + min);
  // The maximum is inclusive and the minimum is inclusive
}

export function getRandFloat(
  min: number,
  max: number,
  decimalPlaces = 2
): number {
  const rand =
    Math.random() < 0.5
      ? (1 - Math.random()) * (max - min) + min
      : Math.random() * (max - min) + min; // could be min or max or anything in between
  const power = 10 ** decimalPlaces;
  return Math.floor(rand * power) / power;
}

export function roundMax(num: number): number {
  return Math.round(num * 100) / 100;
}

export function calcScore(
  tAttRating: number,
  tDefRating: number,
  otAttRating: number,
  otDefRating: number
): number[] {
  const gF = tAttRating - otDefRating;
  const gA = otAttRating - tDefRating;
  const combinedAtt = tAttRating + otAttRating;
  const combinedDef = tDefRating + otDefRating;
  const gD = gF - gA;
  let result = '';
  let randIndex = getRandomInt(0, 9);

  if (gD > 40) {
    result = getResultArr(8, 1, 1)[randIndex];
  } else if (gD > 20) {
    result = getResultArr(7, 2, 1)[randIndex];
  } else if (gD > 10) {
    result = getResultArr(6, 2, 2)[randIndex];
  } else if (gD > 0) {
    result = getResultArr(4, 4, 2)[randIndex];
  } else if (gD > -10) {
    result = getResultArr(2, 4, 4)[randIndex];
  } else if (gD > -20) {
    result = getResultArr(2, 2, 6)[randIndex];
  } else if (gD > -40) {
    result = getResultArr(1, 2, 7)[randIndex];
  } else {
    result = getResultArr(1, 1, 8)[randIndex];
  }

  randIndex = getRandomInt(0, 10);
  switch (result) {
    case 'win':
      if (combinedAtt > combinedDef && gD > 20) {
        return [
          [2, 0],
          [2, 1],
          [2, 1],
          [3, 1],
          [3, 1],
          [4, 1],
          [4, 2],
          [5, 1],
          [4, 1],
          [6, 1],
          [3, 0],
        ][randIndex];
      }
      return combinedAtt > combinedDef
        ? [
            [1, 0],
            [2, 1],
            [2, 1],
            [2, 1],
            [2, 1],
            [3, 1],
            [3, 2],
            [3, 2],
            [4, 2],
            [4, 3],
            [3, 0],
          ][randIndex]
        : [
            [1, 0],
            [1, 0],
            [1, 0],
            [1, 0],
            [2, 1],
            [2, 0],
            [2, 0],
            [2, 0],
            [3, 0],
            [3, 1],
            [1, 0],
          ][randIndex];
    case 'loss':
      if (combinedAtt > combinedDef && gD < -20) {
        return [
          [0, 2],
          [1, 2],
          [1, 2],
          [1, 3],
          [1, 3],
          [1, 4],
          [2, 4],
          [1, 5],
          [1, 4],
          [1, 6],
          [0, 3],
        ][randIndex];
      }
      return combinedAtt > combinedDef
        ? [
            [0, 1],
            [1, 2],
            [1, 2],
            [1, 2],
            [1, 2],
            [1, 3],
            [2, 3],
            [2, 3],
            [3, 4],
            [0, 3],
            [0, 3],
          ][randIndex]
        : [
            [0, 1],
            [0, 1],
            [0, 1],
            [0, 1],
            [1, 2],
            [0, 2],
            [0, 2],
            [0, 2],
            [0, 3],
            [1, 3],
            [0, 1],
          ][randIndex];
    case 'draw':
      return combinedAtt > combinedDef
        ? [
            [3, 3],
            [2, 2],
            [1, 1],
            [1, 1],
            [2, 2],
            [0, 0],
            [2, 2],
            [1, 1],
            [4, 4],
            [3, 3],
            [1, 1],
          ][randIndex]
        : [
            [0, 0],
            [0, 0],
            [0, 0],
            [1, 1],
            [1, 1],
            [1, 1],
            [1, 1],
            [2, 2],
            [3, 3],
            [0, 0],
            [0, 0],
          ][randIndex];
    default:
      return combinedAtt > combinedDef
        ? [
            [3, 3],
            [2, 2],
            [1, 1],
            [1, 1],
            [2, 2],
            [0, 0],
            [2, 2],
            [1, 1],
            [4, 4],
            [3, 3],
            [1, 1],
          ][randIndex]
        : [
            [0, 0],
            [0, 0],
            [0, 0],
            [1, 1],
            [1, 1],
            [1, 1],
            [1, 1],
            [2, 2],
            [3, 3],
            [0, 0],
            [0, 0],
          ][randIndex];
  }
}

export function calcSumRating(arr: number[]): number {
  const sum = arr.reduce((partialSum, a) => partialSum + a, 0);
  const avg = sum / arr.length;
  return Math.round(avg * 10) / 10;
}

/**
 *
 * @function Takes any value and returns a boolean that is true if the value is a non-empty string array and false if not.
 * @param value any type of value
 * @returns boolean
 */
export function isArrayOfStrings(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === 'string')
  );
}

export function groupLetters(index: number) {
  const letters = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
  ];
  return letters[index];
}

export const originalOrder = (): number => 0;
