import { SubmittedRoster } from '../../models/roster.model';

export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  savedRosters?: SubmittedRoster[];
  submittedRosters?: SubmittedRoster[];
}
