import {Role} from './role';
import {Group} from './group';

export class UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  group: Group;

  createdBy: UserProfile;
  createdDate: Date;
  updatedBy: UserProfile;
  updatedDate: Date;
  version: number;
}
