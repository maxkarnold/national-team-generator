import { Timestamp } from '@firebase/firestore-types';

export interface LastName {
    name: string;
    duplicate: boolean;
    alphabeticalId: number;
    usages: string[];    
    timestamp?: Timestamp;
    firestoreId?: string;
}