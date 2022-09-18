import { User } from '@core/services/user.model';
import { Player } from './player.model';

export interface RosterData {
  user: User;
  id: string;
  nationOrTier: string;
}

export interface Roster extends RosterData {
  tier: string;
  nation: string;
  players: Player[];
  starters?: Player[];
  benchReserves?: Player[];
  startersRating?: number;
  squadRating?: number;
  formation?: string;
}
