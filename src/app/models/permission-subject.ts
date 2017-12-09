import {Permission} from './permission';

export class PermissionSubject {
  displayName: string;
  CREATE: Permission;
  READ: Permission;
  UPDATE: Permission;
  DELETE: Permission;

  constructor(subject: string) {
    this.displayName = subject;
  }
}
