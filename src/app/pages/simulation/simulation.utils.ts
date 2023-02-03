import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
// import { hosts } from '@shared/constants/constants';
import { getRandFloat, getRandomInt } from '@shared/utils';
import { GroupTeam, Nation } from 'app/models/nation.model';
import { get } from 'lodash';
import { Match, Region } from './simulation.model';

export const regions: Region[] = [
  {
    label: 'UEFA',
    value: 'uefa',
    numOfTeams: 49,
    qualifiers: {
      auto: 0,
      extra: 0,
    },
  },
  {
    label: 'CAF',
    value: 'caf',
    numOfTeams: 39,
    qualifiers: {
      auto: 0,
      extra: 0,
    },
  },
  {
    label: 'AFC',
    value: 'afc',
    numOfTeams: 30,
    qualifiers: {
      auto: 0,
      extra: 0,
    },
  },
  {
    label: 'CONCACAF',
    value: 'concacaf',
    numOfTeams: 22,
    qualifiers: {
      auto: 0,
      extra: 0,
    },
  },
  {
    label: 'CONMEBOL',
    value: 'conmebol',
    numOfTeams: 10,
    qualifiers: {
      auto: 0,
      extra: 0,
    },
  },
  {
    label: 'OFC',
    value: 'ofc',
    numOfTeams: 6,
    qualifiers: {
      auto: 0,
      extra: 0,
    },
  },
];

export function extraTimeResult(match: Match) {
  return match.penaltyWin ? ` after winning on penalties` : match.etWin ? ` after extra time` : '';
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
      return b.attRating - a.attRating;
    })
    .map((team, i) => ({
      ...team,
      attRanking: i + 1,
    }))
    .sort((a, b) => {
      return b.midRating - a.midRating;
    })
    .map((team, i) => ({
      ...team,
      midRanking: i + 1,
    }))
    .sort((a, b) => {
      return b.defRating - a.defRating;
    })
    .map((team, i) => ({
      ...team,
      defRanking: i + 1,
    }))
    .map(team => {
      if (team.coach?.rating) {
        return {
          ...team,
          rating: hasCoaches ? (team.coach.rating + team.attRating + team.defRating + team.midRating) / 4 : team.rating,
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

export function calcScore(team: GroupTeam, opp: GroupTeam, extraTime: boolean): [number, number, boolean] {
  const eventTimes = [15, 30, 45, 60, 75, 90];
  if (extraTime) {
    eventTimes.push(105, 120);
  }
  const gF = team.attRating + team.midRating / 2 - (opp.midRating / 2 + opp.defRating);
  const gA = opp.attRating + opp.midRating / 2 - (team.midRating / 2 + team.defRating);

  let teamMultiplier = ((gF + 80) / 160) * 50;
  let oppMultiplier = ((gA + 80) / 160) * 50;
  if (team.homeTeam) {
    teamMultiplier += 2.5;
  }
  if (opp.homeTeam) {
    oppMultiplier += 2.5;
  }

  if (team.coach?.rating && opp.coach?.rating) {
    if (team.coach.rating > opp.coach.rating) {
      teamMultiplier += 2;
    } else {
      oppMultiplier += 2;
    }
  }
  let goalFor = 0;
  let goalAg = 0;
  let etWin = false;

  for (let i = 0; i < eventTimes.length; i++) {
    // teamMultiplier and oppMultiplier have range of (0 - 100) * 1.25
    const rand1 = getRandFloat(0, 100);
    const rand2 = getRandFloat(0, 100);
    let teamAdv = teamMultiplier;
    let oppAdv = oppMultiplier;

    if (eventTimes[i] < 90) {
      if (goalFor === 0) {
        teamAdv -= 5;
      }

      if (goalAg === 0) {
        oppAdv -= 5;
      }
    }

    if (goalFor === goalAg && eventTimes[i] !== 90) {
      teamAdv -= 5;
      oppAdv -= 5;
    }

    if (rand1 <= teamAdv) {
      goalFor++;
      if (teamAdv > 35 && getRandomInt(0, 10) < 6) {
        goalFor++;
      }
    }

    if (rand2 <= oppAdv) {
      goalAg++;
      if (oppAdv > 35 && getRandomInt(0, 10) < 6) {
        goalAg++;
      }
    }

    if (eventTimes[i] === 90 && goalFor !== goalAg) {
      break;
    }

    if (eventTimes[i] === 120 && goalFor !== goalAg) {
      etWin = true;
      break;
    }
  }
  // console.log(teamMultiplier, oppMultiplier);
  // console.log([goalFor, goalAg, etWin], [team.homeTeam, opp.homeTeam]);

  return [goalFor, goalAg, etWin];
}

export function getGradeSummary({ name: nationName, reportCard, matchesPlayed }: GroupTeam): string {
  const name = nationName
    .split(' ')
    .map(l => l[0].toLocaleUpperCase() + l.substring(1))
    .join(' ');
  const grade = reportCard.grade;
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

export function matchScore(team: GroupTeam, otherTeam: GroupTeam, hasExtraTime: boolean): Match {
  const [goalsFor, goalsAg, etWin] = calcScore(team, otherTeam, hasExtraTime);

  const penaltyWin = goalsFor === goalsAg;

  const whoWon = (gf: number, ga: number): { winner: GroupTeam; loser: GroupTeam; score: string } => {
    if (penaltyWin) {
      let rand = getRandFloat(0, 1);
      const firstTeamAdvantage = team.penRating > otherTeam.penRating;
      const firstTeamWin = { winner: team, loser: otherTeam, score: `${goalsFor}-${goalsAg}` };
      const secondTeamWin = { winner: otherTeam, loser: team, score: `${goalsAg}-${goalsFor}` };

      if (firstTeamAdvantage && rand > 0.25) {
        return firstTeamWin;
      } else if (!firstTeamAdvantage && rand > 0.25) {
        return secondTeamWin;
      } else {
        rand = getRandFloat(0, 1);
        return rand > 0.5 ? firstTeamWin : secondTeamWin;
      }
    }
    return gf > ga
      ? { winner: team, loser: otherTeam, score: `${goalsFor}-${goalsAg}` }
      : { winner: otherTeam, loser: team, score: `${goalsAg}-${goalsFor}` };
  };

  const { winner, loser, score } = whoWon(goalsFor, goalsAg);

  return {
    goalsFor,
    goalsAg,
    etWin,
    penaltyWin,
    winner,
    loser,
    score,
  };
}

export function getDisplayRating(rating: number) {
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
  if (numOfTeams === 32) {
    return filteredNations.filter(n => n.canSoloHost32 || n.cohosts32.length > 0);
  }
  return filteredNations;
}

export function validateHosts(control: AbstractControl) {
  const hosts: GroupTeam[] = control.value;
  if (hosts.length < 2 && hosts.filter(h => h.canSoloHost32).length < 1) {
    return { invalidHosts: true };
  }
  return null;
}
