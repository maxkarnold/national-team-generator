import { getRandomInt } from '@shared/utils';
import { GroupTeam } from 'app/models/nation.model';
import { Match } from './simulation.model';

export function extraTimeResult(match: Match) {
  return match.penaltyWin
    ? ` after winning on penalties`
    : match.etWin
    ? ` after extra time`
    : '';
}

function getResultArr(wins: number, draws: number, losses: number): string[] {
  return [
    ...Array(wins).fill('win'),
    ...Array(losses).fill('loss'),
    ...Array(draws).fill('draw'),
  ];
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

export const reportCard = ({
  name: nationName,
  grade,
  matchesPlayed,
}: GroupTeam): string => {
  const name = nationName
    .split(' ')
    .map((l) => l[0].toLocaleUpperCase() + l.substring(1))
    .join(' ');
  if (matchesPlayed < 3) {
    return `${name} did not qualify for the tournament, their players had to watch from the comfort of their own homes.`;
  }
  switch (grade) {
    case 's':
      return `${name} had perhaps their best performance at a major tournament ever! Fans will be ecstatic as ${name} blew expectations out of the water. No one thought they would make it this far.`;
    case 'a':
      return `What a tournament for ${name}! It was a resounding success that will send fans home with a smile.`;
    case 'b':
      return `A fairly decent tournament for ${name}. There should be no complaints as they were able to meet expectations.`;
    case 'c':
      return `The tournament was very mediocre for ${name}. Most likely no one will be fired, but perhaps players will be regretting this missed chance.`;
    case 'd':
      return `The tournament could have gone a lot better for ${name}, even if they didn't fully embarrass themselves.`;
    case 'f':
      return `This tournament was an absolute disaster in the eyes of the media. Head coach for the ${name} national team will most likely be fired shortly.`;
    default:
      return 'ERROR';
  }
};
