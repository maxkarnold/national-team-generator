import { round, sample } from 'lodash-es';

export const originalOrder = (): number => 0;

export const probability = (n: number) => {
  return !!n && Math.random() <= n;
};

export const pickSingleLastName = (names: string[]) => {
  if (names.length > 0) {
    const char = names[0].charAt(0);
    const isLowerCase = char === char.toLowerCase() && char !== char.toUpperCase();
    return isLowerCase ? names[1] : names[0];
  }
  return '';
};

export function getAbbrevString(str: string): string {
  return str.split(' ').join('').slice(0, 3);
}

export function getAbbrevNumber(n: number): string {
  if (n >= 1000000) {
    return '€' + round(n / 1000000, 1).toString() + ' mil';
  } else if (n >= 1000) {
    return '€' + round(n / 1000, 1).toString() + ' k';
  } else {
    return '€' + n.toString();
  }
}

export function getRandomPersonality(): string {
  const personalities = [
    'Model Citizen',
    'Perfectionist',
    'Resolute',
    'Model Professional',
    'Professional',
    'Fairly Professional',
    'Spirited',
    'Very Ambitious',
    'Ambitious',
    'Driven',
    'Determined',
    'Fairly Determined',
    'Charismatic Leader',
    'Born Leader',
    'Leader',
    'Iron Willed',
    'Resilient',
    'Jovial',
    'Light-hearted',
    'Devoted',
    'Very Loyal',
    'Loyal',
    'Fairly Loyal',
    'Honest',
    'Sporting',
    'Fairly Sporting',
    'Unsporting',
    'Realist',
    'Balanced',
    'Slack',
    'Casual',
    'Temperamental',
    'Unambitious',
    'Easily discouraged',
    'Low determination',
    'Spineless',
    'Low self-belief',
  ];

  return sample(personalities) || 'Balanced';
}

export function formatDecimal(num: number, decimals: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

export function median(values: number[]) {
  if (values.length === 0) {
    throw new Error('No inputs');
  }

  values.sort((a, b) => a - b);

  const half = Math.floor(values.length / 2);

  if (values.length % 2) {
    return values[half];
  }

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
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
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

export function getRandomInts(quantity: number, min: number, max: number): Set<number> {
  const set = new Set<number>();
  while (set.size < quantity) {
    set.add(getRandomInt(min, max));
  }
  return set;
}

export function getRandFloat(min: number, max: number, decimalPlaces = 2): number {
  const rand = Math.random() < 0.5 ? (1 - Math.random()) * (max - min) + min : Math.random() * (max - min) + min; // could be min or max or anything in between
  const power = 10 ** decimalPlaces;
  return Math.floor(rand * power) / power;
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
  return Array.isArray(value) && value.length > 0 && value.every(item => typeof item === 'string');
}

export function groupByProp(arr: Record<string, any>[], prop: string) {
  return arr.reduce((memo, x) => {
    if (!memo[x[prop]]) {
      memo[x[prop]] = [];
    }
    memo[x[prop]].push(x);
    return memo;
  }, {});
}
