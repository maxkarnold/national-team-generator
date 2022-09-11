export interface Nation {
  name: string;
  logo: string;
  region: 'uefa' | 'conmebol' | 'afc' | 'ofc' | 'concacaf' | 'caf';
  mainLeagues: string[];
  secondLeagues: string[];
  thirdLeagues: string[];
  rareLeagues: string[];
  excludeLeagues: string[];
}
