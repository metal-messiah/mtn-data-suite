import {Permission} from './permission';

class UserProfile {
}

export class Role {
  id: number;
  displayName: string;
  description: string;

  members: UserProfile[];
  permissions: Permission[];

  createdBy: UserProfile;
  createdDate: Date;
  updatedBy: UserProfile;
  updatedDate: Date;
  version: number;
}
