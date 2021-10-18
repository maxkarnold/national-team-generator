// import {}

import { Player } from './player';

export interface SubmittedRoster {
    user: string;
    id: string;
    tier: string;
    nation: string;
    startersRating: number;
    squadRating: number;
    roster: {
        starters: Player[];
        benchReserves: Player[];  
    }
}