import {Permission} from './permission';

export class PermissionSubject {
  displayName: string;
  actions: Permission[];

  constructor(subject: string) {
    this.displayName = subject;
    this.actions = new Array<Permission>();
  }

  addPermission(permission: Permission) {
    this.actions.push(permission);
  }
}
