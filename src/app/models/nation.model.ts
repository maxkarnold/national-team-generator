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
