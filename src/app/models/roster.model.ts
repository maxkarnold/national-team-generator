import { Player } from './player.model';

export interface SubmittedRoster {
  user: string;
  id: string;
  tier: string;
  nation: string;
  startersRating: number;
  squadRating: number;
  formation: string;
  roster: {
    starters?: Player[];
    benchReserves?: Player[];
    sortedRoster: Player[];
  };
}
