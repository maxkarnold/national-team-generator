import { PlayingTime } from './player/player.model';

export const tableHeaders = [
  'Year',
  'Age',
  'Team',
  'Info (Transfer)',
  'App',
  'Goals',
  'Assists',
  'Avg Rating',
  'Wage (£/week)',
  'Player Role',
];

export const fringeRoles: (PlayingTime | undefined)[] = ['breakthrough prospect', 'fringe player', 'impact sub'];

export const squadRoles: (PlayingTime | undefined)[] = ['squad player', 'regular starter', 'important player', 'star player'];

export const CLUB_MULTIPLIER = 2.5;

export const playerToClubAbility = (ability: number) => {
  return ability * CLUB_MULTIPLIER + 115 - ability / 1.8;
};

export const ageFactor = (age: number, ability: number, hasLoanOption: boolean) => {
  const limitYouthClub = false;
  if (age < 18 && !limitYouthClub && !hasLoanOption) {
    return CLUB_MULTIPLIER * 400;
  } else {
    return playerToClubAbility(ability);
  }
};
