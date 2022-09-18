import { Roster } from '../../models/roster.model';

export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  savedRosters?: Roster[];
  submittedRosters?: Roster[];
}
