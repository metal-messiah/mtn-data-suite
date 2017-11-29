import {Role} from './role';
import {Group} from './group';

export class User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  group: Group;
}
