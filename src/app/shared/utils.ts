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

export function getRandFloat(min: number, max: number, decimalPlaces = 2) {
  const rand =
    Math.random() < 0.5
      ? (1 - Math.random()) * (max - min) + min
      : Math.random() * (max - min) + min; // could be min or max or anything in between
  const power = 10 ** decimalPlaces;
  return Math.floor(rand * power) / power;
}

export function roundMax(num: number) {
  return Math.round(num * 100) / 100;
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


