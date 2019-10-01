import { AuditingEntity } from '../auditing-entity';
import { UserProfile } from './user-profile';
import { Boundary } from './boundary';

export class UserBoundary {
  id: number;
  boundaryId: number;
  boundaryName?: string;

  user?: UserProfile;
  boundary?: Boundary;

  constructor(obj) {
    Object.assign(this, obj);
  }
}
