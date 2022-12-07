import { Timestamp } from '@firebase/firestore-types';
import { Roster } from '../../models/roster.model';

export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  savedRosters?: Roster[];
  submittedRosters?: Roster[];
}

export interface FirstName {
  name: string;
  duplicate: boolean;
  randomNum: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  timestamp: Timestamp;
  usages: string[];
  gender: string;
}

export interface LastName {
  name: string;
  duplicate: boolean;
  randomNum: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  timestamp: Timestamp;
  usages: string[];
  alphabeticalId: number;
}

export type Name = FirstName | LastName;

export function isFirstName(x: FirstName): x is FirstName {
  return (x as FirstName).gender !== undefined;
}
