import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { compare, getRandFloat, getRandomInt, getRandomInts } from '@shared/utils';
import { GroupTeam } from 'app/models/nation.model';
import { sum } from 'lodash-es';
import { Match, Region, MatchEvent, EventEmoji, RegionName, KnockoutRound } from './simulation.model';

const getAdjustedTime = (time: number) => {
  if (time > 120) {
    return (time += 20);
  }
  if (time > 105) {
    return (time += 15);
  }
  if (time > 90) {
    return (time += 10);
  }
  if (time > 45) {
    return (time += 5);
  }
  return time;
};

function whoWon(
  goalsFor: number,
  goalsAg: number,
  forEvents: MatchEvent[],
  oppEvents: MatchEvent[],
  team: GroupTeam,
  otherTeam: GroupTeam,
  isPenaltyWin: boolean
): { winner: GroupTeam; loser: GroupTeam; score: string; adjustedEventTimes: { winner: MatchEvent[]; loser: MatchEvent[] } } {
  const firstTeamWin = {
    winner: team,
    loser: otherTeam,
    score: `${goalsFor}-${goalsAg}`,
    adjustedEventTimes: { winner: forEvents, loser: oppEvents },
  };
  const secondTeamWin = {
    winner: otherTeam,
    loser: team,
    score: `${goalsAg}-${goalsFor}`,
    adjustedEventTimes: { winner: oppEvents, loser: forEvents },
  };
  if (isPenaltyWin) {
    let rand = getRandFloat(0, 1);
    const firstTeamAdvantage = team.dynamicRating.pen > otherTeam.dynamicRating.pen;

    if (firstTeamAdvantage && rand > 0.25) {
      return firstTeamWin;
    } else if (!firstTeamAdvantage && rand > 0.25) {
      return secondTeamWin;
    } else {
      rand = getRandFloat(0, 1);
      return rand > 0.5 ? firstTeamWin : secondTeamWin;
    }
  }
  return goalsFor > goalsAg ? firstTeamWin : secondTeamWin;
}

function sortEventTimes(a: MatchEvent, b: MatchEvent) {
  const aValues = a.time.split('+').map(str => parseInt(str, 10));
  const bValues = b.time.split('+').map(str => parseInt(str, 10));
  const adjustedA = sum([getAdjustedTime(aValues[0]), aValues[1]]);
  const adjustedB = sum([getAdjustedTime(bValues[0]), bValues[1]]);

  if (adjustedA < adjustedB) {
    return -1;
  }
  if (adjustedA > adjustedB) {
    return 1;
  }
  return 0;
}

function getRandomCardTimes(events: MatchEvent[], time: number): MatchEvent[] {
  const canGiveSecondYellow = (evts: MatchEvent[]) => {
    const firstYellows = evts.map(e => e.emoji).filter(e => e === '🟨');
    const secondYellows = evts.map(e => e.emoji).filter(e => e === '🟨🟥');
    return firstYellows.length < secondYellows.length;
  };
  const yellowCards = events.filter(e => e.emoji === '🟨');
  // const redCards = events.filter(e => e.emoji === '🟥' || e.emoji === '🟨🟥');s
  // https://football-observatory.com/IMG/sites/mr/mr57/en/
  const interval = time === 45 || time === 90 || time === 105 || time === 120 ? time + 5 : time;

  const newEventTimes: MatchEvent[] = [];
  for (let i = time - 14; i < interval; i++) {
    const rand = getRandomInt(0, 10000) + yellowCards.length * 100;
    const newTimeStr = i > time ? `${time}+${i - time}` : i.toString();
    let emoji: EventEmoji = '🟨';

    if (events.map(e => e.time).includes(newTimeStr)) {
      continue;
    }

    if (i < 50 && rand < 171) {
      // first half probability
      // 1.66% of 1st half yellow
      // 0.05% of 1st half red
      if (rand < 5) {
        if (rand < 3 && canGiveSecondYellow(events)) {
          emoji = '🟨🟥';
        } else {
          emoji = '🟥';
        }
      }
      newEventTimes.push({
        time: newTimeStr,
        emoji,
      });
    } else if (i > 49 && rand < 346) {
      // second half probability
      // 3.23% of 2nd half yellow
      // 0.23% of 2nd half red
      if (rand < 23) {
        if (rand < 12 && canGiveSecondYellow(events)) {
          emoji = '🟨🟥';
        } else {
          emoji = '🟥';
        }
      }
      newEventTimes.push({
        time: newTimeStr,
        emoji,
      });
    }
  }
  return newEventTimes;
}

function getRandomGoalTimes(forEventTimes: MatchEvent[], oppEventTimes: MatchEvent[], time: number): MatchEvent {
  const interval = time === 45 || time === 90 || time === 105 || time === 120 ? time + 5 : time;
  const events = [...forEventTimes, ...oppEventTimes];

  const newEventTimes = getRandomInts(4, time - 14, interval);
  for (let i = 0; i < newEventTimes.size; i++) {
    const newTime = Array.from(newEventTimes)[i];
    const newTimeStr = newTime > time ? `${time}+${newTime - time}` : newTime.toString();
    if (
      !events
        .filter(e => e.emoji === '⚽')
        .map(e => e.time)
        .includes(newTimeStr)
    ) {
      return {
        time: newTimeStr,
        emoji: '⚽',
      };
    }
  }

  return {
    time: 'ERROR',
    emoji: '🟥',
  };
}

function getRandomInjuryTimes(events: MatchEvent[], time: number): MatchEvent[] {
  // FOR SERIOUS INJURIES, WILL NEED TO REFACTOR FOR MINOR INJURIES
  const injuries = events.filter(e => e.emoji === '🚑');
  // this adds 5 mins to end of half times, to account for added time
  const interval = time === 45 || time === 90 || time === 105 || time === 120 ? time + 5 : time;

  const newEventTimes: MatchEvent[] = [];
  for (let i = time - 14; i < interval; i++) {
    const rand = getRandomInt(0, 10000) + injuries.length * 100;
    const newTimeStr = i > time ? `${time}+${i - time}` : i.toString();
    let emoji: EventEmoji = '🚑';

    if (events.map(e => e.time).includes(newTimeStr)) {
      continue;
    }

    if (i < 50 && rand < 2) {
      // first half probability
      // 0.05% of 1st half red
      emoji = '🚑';
      newEventTimes.push({
        time: newTimeStr,
        emoji,
      });
    } else if (i > 49 && rand < 11) {
      // second half probability
      // 0.23% of 2nd half red
      emoji = '🚑';
      newEventTimes.push({
        time: newTimeStr,
        emoji,
      });
    }
  }
  return newEventTimes;
}

function calcScore(
  team1: GroupTeam,
  team2: GroupTeam,
  canHaveExtraTime: boolean
): { goalsFor: number; goalsAg: number; isEtWin: boolean; forEventTimes: MatchEvent[]; oppEventTimes: MatchEvent[] } {
  // TODO: If team gets a red card, they need to have a lesser chance to score and an increased chance to concede
  const matchTimeIntervals = [15, 30, 45, 60, 75, 90];
  if (canHaveExtraTime) {
    matchTimeIntervals.push(105, 120);
  }
  const team1ScoreRating = team1.dynamicRating.att + team1.dynamicRating.mid / 2 - (team2.dynamicRating.mid / 2 + team2.dynamicRating.def);
  const team2ScoreRating = team2.dynamicRating.att + team2.dynamicRating.mid / 2 - (team1.dynamicRating.mid / 2 + team1.dynamicRating.def);

  let team1Multiplier = ((team1ScoreRating + 80) / 160) * 50;
  let team2Multiplier = ((team2ScoreRating + 80) / 160) * 50;
  if (team1.homeTeam) {
    team1Multiplier += 2.5;
  }
  if (team2.homeTeam) {
    team2Multiplier += 2.5;
  }

  if (team1.coach?.rating && team2.coach?.rating) {
    if (team1.coach.rating > team2.coach.rating) {
      team1Multiplier += (team1.coach.rating - team2.coach.rating) / 10;
    } else {
      team2Multiplier += (team2.coach.rating - team1.coach.rating) / 10;
    }
  }
  let goalsFor = 0;
  let goalsAg = 0;
  let isEtWin = false;

  const forEventTimes: MatchEvent[] = [];
  const oppEventTimes: MatchEvent[] = [];

  for (let i = 0; i < matchTimeIntervals.length; i++) {
    // teamMultiplier and oppMultiplier have range of (0 - 100) * 1.25
    const rand1 = getRandFloat(0, 100);
    const rand2 = getRandFloat(0, 100);
    let teamAdv = team1Multiplier;
    let oppAdv = team2Multiplier;

    if (matchTimeIntervals[i] < 90) {
      if (goalsFor === 0) {
        teamAdv -= 5;
      }

      if (goalsAg === 0) {
        oppAdv -= 5;
      }
    }

    if (goalsFor === goalsAg && matchTimeIntervals[i] !== 90) {
      teamAdv -= 5;
      oppAdv -= 5;
    }

    if (rand1 <= teamAdv) {
      goalsFor++;
      forEventTimes.push(getRandomGoalTimes(forEventTimes, oppEventTimes, matchTimeIntervals[i]));
      if (teamAdv > 35 && getRandomInt(0, 10) < 6) {
        goalsFor++;
        forEventTimes.push(getRandomGoalTimes(forEventTimes, oppEventTimes, matchTimeIntervals[i]));
      }
    }

    if (rand2 <= oppAdv) {
      goalsAg++;
      oppEventTimes.push(getRandomGoalTimes(oppEventTimes, forEventTimes, matchTimeIntervals[i]));
      if (oppAdv > 35 && getRandomInt(0, 10) < 6) {
        goalsAg++;
        oppEventTimes.push(getRandomGoalTimes(oppEventTimes, forEventTimes, matchTimeIntervals[i]));
      }
    }

    forEventTimes.push(...getRandomCardTimes(forEventTimes, matchTimeIntervals[i]));
    oppEventTimes.push(...getRandomCardTimes(oppEventTimes, matchTimeIntervals[i]));

    forEventTimes.push(...getRandomInjuryTimes(forEventTimes, matchTimeIntervals[i]));
    oppEventTimes.push(...getRandomInjuryTimes(oppEventTimes, matchTimeIntervals[i]));

    if (matchTimeIntervals[i] === 90 && goalsFor !== goalsAg) {
      break;
    }

    if (matchTimeIntervals[i] === 120 && goalsFor !== goalsAg) {
      isEtWin = true;
      break;
    }
  }

  // if (goalsFor === goalsAg && canHaveExtraTime) {
  //   getPenaltyResults()
  // }

  forEventTimes.sort(sortEventTimes);
  oppEventTimes.sort(sortEventTimes);

  return { goalsFor, goalsAg, isEtWin, forEventTimes, oppEventTimes };
}

export const regions: Region[] = [
  {
    label: 'UEFA',
    value: RegionName.uefa,
    numOfTeams: 49,
    qualifiers: {
      auto: 0,
      extra: 0,
    },
  },
  {
    label: 'CAF',
    value: RegionName.caf,
    numOfTeams: 39,
    qualifiers: {
      auto: 0,
      extra: 0,
    },
  },
  {
    label: 'AFC',
    value: RegionName.afc,
    numOfTeams: 30,
    qualifiers: {
      auto: 0,
      extra: 0,
    },
  },
  {
    label: 'CONCACAF',
    value: RegionName.concacaf,
    numOfTeams: 22,
    qualifiers: {
      auto: 0,
      extra: 0,
    },
  },
  {
    label: 'CONMEBOL',
    value: RegionName.conmebol,
    numOfTeams: 10,
    qualifiers: {
      auto: 0,
      extra: 0,
    },
  },
  {
    label: 'OFC',
    value: RegionName.ofc,
    numOfTeams: 6,
    qualifiers: {
      auto: 0,
      extra: 0,
    },
  },
];

export function extraTimeResult(match: Match) {
  return match.isPenaltyWin ? ` after winning on penalties` : match.isEtWin ? ` after extra time` : '';
}

export function findTeamInTournament(groups: GroupTeam[][], nation: GroupTeam) {
  return groups.flat().find(t => t.name === nation.name);
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

export function regionsValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const regionsArr: Region[] = control.get('availableRegions')?.value;
    const numOfTeams: number = control.get('numOfTeams')?.value;

    const forbidden =
      regionsArr.reduce((a, b) => {
        return a + b.numOfTeams;
      }, 0) < numOfTeams;

    return forbidden ? { availableRegions: { value: control.value } } : null;
  };
}

export function addRankings(arr: GroupTeam[], hasCoaches?: boolean) {
  return arr
    .sort((a, b) => {
      return b.dynamicRating.att - a.dynamicRating.att;
    })
    .map((team, i) => ({
      ...team,
      attRanking: i + 1,
    }))
    .sort((a, b) => {
      return b.dynamicRating.mid - a.dynamicRating.mid;
    })
    .map((team, i) => ({
      ...team,
      midRanking: i + 1,
    }))
    .sort((a, b) => {
      return b.dynamicRating.def - a.dynamicRating.def;
    })
    .map((team, i) => ({
      ...team,
      defRanking: i + 1,
    }))
    .map(team => {
      if (team.coach?.rating) {
        return {
          ...team,
          rating: hasCoaches ? (team.dynamicRating.att + team.dynamicRating.def + team.dynamicRating.mid) / 3 : team.rating,
        };
      }
      return team;
    })
    .sort((a, b) => {
      return b.rating - a.rating;
    })
    .map((team, i) => ({
      ...team,
      ranking: i + 1,
    }));
}

export function getGradeSummary({ name: nationName, reportCard, matchesPlayed, groupFinish }: GroupTeam): string {
  const name = nationName
    .split(' ')
    .map(l => l[0].toLocaleUpperCase() + l.substring(1))
    .join(' ');
  const grade = reportCard.grade;
  if (matchesPlayed < 3) {
    return `${name} did not qualify for the tournament, their players had to watch from the comfort of their own homes.`;
  }
  const placeSuffix = (place?: string) => {
    switch (place) {
      case '1':
        return '1st';
      case '2':
        return '2nd';
      case '3':
        return '3rd';
      default:
        return `${place}th`;
    }
  };
  const groupFinishSummary: string = `${name} finished ${placeSuffix(groupFinish?.charAt(1))} in Group ${groupFinish?.charAt(0)}. `;
  switch (grade) {
    case 's':
      return (
        `${name} had perhaps their best performance at a major tournament ever! Fans will be ecstatic as ${name} blew expectations out of the water. No one thought they would make it this far. ` +
        groupFinishSummary
      );
    case 'a':
      return `What a tournament for ${name}! It was a resounding success that will send fans home with a smile. ${groupFinishSummary}`;
    case 'b':
      return `A fairly decent tournament for ${name}. There should be no complaints as they were able to meet expectations. ${groupFinishSummary}`;
    case 'c':
      return `The tournament was very mediocre for ${name}. Most likely no one will be fired, but perhaps players will be regretting this missed chance. ${groupFinishSummary}`;
    case 'd':
      return `The tournament could have gone a lot better for ${name}, even if they didn't fully embarrass themselves. ${groupFinishSummary}`;
    case 'f':
      return `This tournament was an absolute disaster in the eyes of the media. Head coach for the ${name} national team will most likely be fired shortly. ${groupFinishSummary}`;
    default:
      return 'ERROR';
  }
}

export function getGradeStyle(grade: string | undefined): '' | 'good-grade' | 'ok-grade' | 'bad-grade' {
  if (grade) {
    switch (grade) {
      case 's':
      case 'a':
        return 'good-grade';
      case 'b':
      case 'c':
        return 'ok-grade';
      case 'd':
      case 'f':
        return 'bad-grade';
      default:
        return 'bad-grade';
    }
  }
  return '';
}

function getTeamBuffs(
  team: GroupTeam,
  otherTeam: GroupTeam,
  winner: GroupTeam,
  loser: GroupTeam,
  forEventTimes: MatchEvent[],
  oppEventTimes: MatchEvent[]
) {
  // for each pos of current buffs
  // iterate through each buff in the array, and subtract the numOfGames by 1
  // if the numOfGames value is 0 then add/subtract the value of its property to the current iterated position and remove it from the array
  // else continue to next buff
  // for (const pos in team.currentBuffs) {
  //   if (Object.prototype.hasOwnProperty.call(team.currentBuffs, pos)) {
  //     const x: Buff[] =
  //   }

  // }

  // team.currentBuffs.forEach((a, b) => {

  // });

  // apply buffs to teams that win and half the teams that draw
  // MIGHT WANT TO CHANGE LATER
  const randBuff = getRandFloat(0, 2.5);
  const buffedPos = getRandomInt(0, 2);
  switch (buffedPos) {
    case 0:
      winner.dynamicRating.att += randBuff;
      break;
    case 1:
      winner.dynamicRating.mid += randBuff;
      break;
    case 2:
      winner.dynamicRating.def += randBuff;
      break;
    default:
      winner.dynamicRating.pen += randBuff;
      break;
  }

  // apply debuffs to teams that lose
  // MIGHT WANT TO CHANGE LATER
  const randDebuff = getRandFloat(0, 1.5);
  const debuffedPos = getRandomInt(0, 2);
  switch (debuffedPos) {
    case 0:
      loser.dynamicRating.att -= randDebuff;
      break;
    case 1:
      loser.dynamicRating.mid -= randDebuff;
      break;
    case 2:
      loser.dynamicRating.def -= randDebuff;
      break;
    default:
      loser.dynamicRating.pen -= randDebuff;
      break;
  }

  // apply injury debuffs to teams
  const forTeamInjuries = forEventTimes.filter(e => e.emoji === '🚑').length;
  const oppTeamInjuries = oppEventTimes.filter(e => e.emoji === '🚑').length;

  for (let i = 0; i < forTeamInjuries; i++) {
    const rand = getRandFloat(1, 5);
    const randPos = getRandomInt(0, 2);
    switch (randPos) {
      case 0:
        team.dynamicRating.att -= rand;
        break;
      case 1:
        team.dynamicRating.mid -= rand;
        break;
      case 2:
        team.dynamicRating.def -= rand;
        break;
      default:
        team.dynamicRating.pen -= rand;
        break;
    }
  }

  for (let i = 0; i < oppTeamInjuries; i++) {
    const rand = getRandFloat(1, 8);
    const randPos = getRandomInt(0, 2);
    switch (randPos) {
      case 0:
        otherTeam.dynamicRating.att -= rand;
        break;
      case 1:
        otherTeam.dynamicRating.mid -= rand;
        break;
      case 2:
        otherTeam.dynamicRating.def -= rand;
        break;
      default:
        otherTeam.dynamicRating.pen -= rand;
        break;
    }
  }

  team.isDebuffed.att = team.dynamicRating.att < team.startingRating.att;
  team.isBuffed.att = team.dynamicRating.att > team.startingRating.att;
  team.isBuffed.mid = team.dynamicRating.mid > team.startingRating.mid;
  team.isDebuffed.mid = team.dynamicRating.mid < team.startingRating.mid;
  team.isDebuffed.def = team.dynamicRating.def < team.startingRating.def;
  team.isBuffed.def = team.dynamicRating.def > team.startingRating.def;
  team.isDebuffed.pen = team.dynamicRating.pen < team.startingRating.pen;
  team.isBuffed.pen = team.dynamicRating.pen > team.startingRating.pen;

  otherTeam.isDebuffed.att = otherTeam.dynamicRating.att < otherTeam.startingRating.att;
  otherTeam.isBuffed.att = otherTeam.dynamicRating.att > otherTeam.startingRating.att;
  otherTeam.isDebuffed.mid = otherTeam.dynamicRating.mid < otherTeam.startingRating.mid;
  otherTeam.isBuffed.mid = otherTeam.dynamicRating.mid > otherTeam.startingRating.mid;
  otherTeam.isDebuffed.def = otherTeam.dynamicRating.def < otherTeam.startingRating.def;
  otherTeam.isBuffed.def = otherTeam.dynamicRating.def > otherTeam.startingRating.def;
  otherTeam.isDebuffed.pen = otherTeam.dynamicRating.pen < otherTeam.startingRating.pen;
  otherTeam.isBuffed.pen = otherTeam.dynamicRating.pen > otherTeam.startingRating.pen;
}

export function matchScore(team: GroupTeam, otherTeam: GroupTeam, hasExtraTime: boolean): Match {
  const { goalsFor, goalsAg, isEtWin, forEventTimes, oppEventTimes } = calcScore(team, otherTeam, hasExtraTime);

  const isPenaltyWin = goalsFor === goalsAg;

  const { winner, loser, score, adjustedEventTimes } = whoWon(
    goalsFor,
    goalsAg,
    forEventTimes,
    oppEventTimes,
    team,
    otherTeam,
    isPenaltyWin
  );

  getTeamBuffs(team, otherTeam, winner, loser, forEventTimes, oppEventTimes);

  return {
    goalsFor,
    goalsAg,
    isEtWin,
    isPenaltyWin,
    winner,
    loser,
    score,
    eventTimes: adjustedEventTimes,
  };
}

export function getDisplayRating(rating: number, isGrade?: boolean) {
  if (isGrade) {
    // ==== TWO OPTIONS
    // ==== WITH PLUSES AND MINUSES

    // if (rating > 96) {
    //   return 'S+';
    // } else if (rating > 93) {
    //   return 'S';
    // } else if (rating > 90) {
    //   return 'S-';
    // } else if (rating > 86) {
    //   return 'A+';
    // } else if (rating > 83) {
    //   return 'A';
    // } else if (rating > 80) {
    //   return 'A-';
    // } else if (rating > 76) {
    //   return 'B+';
    // } else if (rating > 73) {
    //   return 'B';
    // } else if (rating > 70) {
    //   return 'B-';
    // } else if (rating > 66) {
    //   return 'C+';
    // } else if (rating > 63) {
    //   return 'C';
    // } else if (rating > 60) {
    //   return 'C-';
    // } else if (rating > 56) {
    //   return 'D+';
    // } else if (rating > 53) {
    //   return 'D';
    // } else if (rating > 50) {
    //   return 'D-';
    // } else if (rating > 46) {
    //   return 'F+';
    // } else if (rating > 43) {
    //   return 'F';
    // } else {
    //   return 'F-';
    // }
    // ==== OR WITHOUT
    if (rating > 90) {
      return 'S';
    } else if (rating > 80) {
      return 'A';
    } else if (rating > 70) {
      return 'B';
    } else if (rating > 60) {
      return 'C';
    } else if (rating > 50) {
      return 'D';
    } else {
      return 'F';
    }
  }
  return Math.floor(rating);
}

export function getHostNations(filteredNations: GroupTeam[], numOfTeams: number): GroupTeam[] {
  // for each region that is available push an array of potential hosts
  // Nations with enough money and space can qualify if they don't have enough stadiums
  // ======= 32 TEAM RULES ALL REGIONS =======
  //  only 2 nations may host
  // must have at least 8 stadiums, minimum 40,000 capacity stadiums
  // must have a stadium that is at least 70,000 capacity
  // ======= 48 TEAM RULES ALL REGIONS =======
  // for 48 team tournament, the rules are unknown but you should have at least 14 stadiums with at least 40,000 capacity
  // must have one stadium at least about 80,000 capacity
  // up to 4 nations may host
  if (numOfTeams < 33) {
    return filteredNations.filter(n => n.canSoloHost32 || n.cohosts32.length > 0);
  } else if (numOfTeams > 32) {
    return filteredNations.filter(n => n.canSoloHost48 || n.cohosts48.length > 0 || n.triHosts48.length > 0 || n.quadHosts48.length > 0);
  }
  return filteredNations;
}

export function validateHosts(control: AbstractControl) {
  const hosts: GroupTeam[] = control.value;
  const numOfTeams: number = parseInt(control.parent?.get('numOfTeams')?.value, 10);
  const cannotHost32 = numOfTeams === 32 && hosts.length < 2 && hosts.filter(h => h.canSoloHost32).length < 1;
  const hostNamesArr = hosts.map(h => h.name);
  const cannotHost48 =
    numOfTeams === 48 &&
    ((hosts.length === 1 && hosts.filter(h => h.canSoloHost48).length < 1) ||
      (hosts.length === 2 &&
        hosts.filter(h => hostNamesArr.every(name => (name === h.name ? true : h.cohosts48.includes(name)))).length < 2) ||
      (hosts.length === 3 &&
        hosts.filter(h => hostNamesArr.every(name => (name === h.name ? true : h.triHosts48.includes(name)))).length < 3) ||
      (hosts.length === 4 &&
        hosts.filter(h => hostNamesArr.every(name => (name === h.name ? true : h.quadHosts48.includes(name)))).length < 4));
  if (cannotHost32 || cannotHost48) {
    return { invalidHosts: true };
  }
  return null;
}

export function regionQualifierHelper(
  region: Region,
  tournamentSize: 32 | 48,
  hostNations: GroupTeam[]
): { matches: number; matches2: number } {
  const hostsFromRegion = hostNations.filter(n => n.region === region.value);

  if (tournamentSize === 48) {
    switch (region.value) {
      case RegionName.uefa:
        return {
          matches: 8,
          matches2: 4,
        };
      case RegionName.caf:
        return {
          matches: 2,
          matches2: 1,
        };
      case RegionName.afc:
        return {
          matches: 1,
          matches2: 0,
        };
      case RegionName.ofc:
        return {
          matches: hostsFromRegion.length > 1 ? 0 : 2,
          matches2: hostsFromRegion.length > 1 ? 0 : 1,
        };
      case RegionName.concacaf:
        return {
          matches: 0,
          matches2: 0,
        };
      case RegionName.conmebol:
        return {
          matches: 0,
          matches2: 0,
        };
      default:
        return {
          matches: 0,
          matches2: 0,
        };
    }
  } else {
    return {
      matches: 0,
      matches2: 0,
    };
  }
}

export function roundOf32Helper(groups: GroupTeam[][]): { gWinners: GroupTeam[][]; roundOf32?: KnockoutRound } {
  if (groups.length === 8) {
    return { gWinners: groups.map(group => group.slice(0, 2)), roundOf32: undefined };
  } else {
    // TODO: Fix so that the same group teams can't be put together.
    // group length is 12
    // assign numbers to letter values, to improve readability of code
    // CAN BE REMOVED
    const [a, b, c, d, e, f, g, h, i, j, k, l] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    const thirdPlaceTeams = groups
      .flatMap(group => group[2])
      .sort((x, y) => y.points - x.points || y.gDiff - x.gDiff || y.gFor - x.gFor || compare(x.name, y.name, true));
    const knockoutCandidates = thirdPlaceTeams.slice(0, 8);
    const gWinners = groups.map(group => group.slice(0, 2));
    const roundOf32: KnockoutRound = [
      [gWinners[a][0], knockoutCandidates[0], matchScore(gWinners[a][0], knockoutCandidates[0], true)],
      [gWinners[c][0], knockoutCandidates[7], matchScore(gWinners[c][0], knockoutCandidates[7], true)],
      [gWinners[b][0], gWinners[f][1], matchScore(gWinners[b][0], gWinners[f][1], true)],
      [gWinners[d][1], gWinners[e][1], matchScore(gWinners[d][1], gWinners[e][1], true)],
      [gWinners[g][0], knockoutCandidates[3], matchScore(gWinners[g][0], knockoutCandidates[3], true)],
      [gWinners[h][0], knockoutCandidates[4], matchScore(gWinners[h][0], knockoutCandidates[4], true)],
      [gWinners[i][0], gWinners[l][1], matchScore(gWinners[i][0], gWinners[l][1], true)],
      [gWinners[j][1], gWinners[k][1], matchScore(gWinners[j][1], gWinners[k][1], true)],
      [gWinners[l][0], knockoutCandidates[1], matchScore(gWinners[l][0], knockoutCandidates[1], true)],
      [gWinners[k][0], knockoutCandidates[6], matchScore(gWinners[k][0], knockoutCandidates[6], true)],
      [gWinners[j][0], gWinners[i][1], matchScore(gWinners[j][0], gWinners[i][1], true)],
      [gWinners[g][1], gWinners[h][1], matchScore(gWinners[g][1], gWinners[h][1], true)],
      [gWinners[b][1], gWinners[a][1], matchScore(gWinners[b][1], gWinners[a][1], true)],
      [gWinners[d][0], gWinners[c][1], matchScore(gWinners[d][0], gWinners[c][1], true)],
      [gWinners[e][0], knockoutCandidates[2], matchScore(gWinners[e][0], knockoutCandidates[2], true)],
      [gWinners[f][0], knockoutCandidates[5], matchScore(gWinners[f][0], knockoutCandidates[5], true)],
    ];

    roundOf32.forEach(t => {
      t[2].winner.matchHistory.bracket.push({ match: t[2], opp: t[2].loser });
      t[2].loser.matchHistory.bracket.push({ match: t[2], opp: t[2].winner });
    });

    return {
      gWinners: [
        [roundOf32[0][2].winner, roundOf32[11][2].winner],
        [roundOf32[10][2].winner, roundOf32[1][2].winner],
        [roundOf32[2][2].winner, roundOf32[9][2].winner],
        [roundOf32[8][2].winner, roundOf32[3][2].winner],
        [roundOf32[4][2].winner, roundOf32[13][2].winner],
        [roundOf32[12][2].winner, roundOf32[5][2].winner],
        [roundOf32[6][2].winner, roundOf32[15][2].winner],
        [roundOf32[14][2].winner, roundOf32[7][2].winner],
      ],
      roundOf32,
    };
  }
}
