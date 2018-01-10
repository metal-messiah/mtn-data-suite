import {Permission} from './permission';
import {UserProfile} from './user-profile';

export class Role {
  id: number;
  displayName: string;
  description: string;

  members: UserProfile[] = [];
  permissions: Permission[];

  createdBy: UserProfile;
  createdDate: Date;
  updatedBy: UserProfile;
  updatedDate: Date;
  version: number;
}
