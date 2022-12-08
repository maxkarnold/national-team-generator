export interface Nation {
  name: string;
  logo: string;
  region: 'uefa' | 'conmebol' | 'afc' | 'ofc' | 'concacaf' | 'caf';
  firstNameUsages: string[];
  lastNameUsages: string[];
  mainLeagues: string[];
  secondLeagues: string[];
  thirdLeagues: string[];
  rareLeagues: string[];
  excludeLeagues: string[];
}

export interface GroupTeam {
  name: string;
  logo: string;
  region: string;
  points: number;
  gDiff: number;
  gFor: number;
  gOpp: number;
  tier: string;
  attRating: number;
  defRating: number;
  rating: number;
  matchesPlayed: number;
}
