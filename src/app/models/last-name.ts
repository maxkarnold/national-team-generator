import { Timestamp } from '@firebase/firestore-types';

export interface LastName {
    name: string;
    duplicate: boolean;
    id: number;
    usages: string[];    
    timestamp?: Timestamp;
}