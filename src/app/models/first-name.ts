import { Timestamp } from '@firebase/firestore-types';

export interface FirstName {
  duplicate: boolean;
  gender: string;
  name: string;
  timestamp: Timestamp;
  usages: string[];
  alphabeticalId: number;
  firestoreId?: string;
}
