import { Role } from './role';
import { Group } from './group';
import { AuditingEntity } from '../auditing-entity';
import { SimplifiedStoreList } from '../simplified/simplified-store-list';
import { SimplifiedPermission } from '../simplified/simplified-permission';

export class UserProfile extends AuditingEntity {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  group: Group;

  subscribedStoreLists: SimplifiedStoreList[];
  createdStoreLists: SimplifiedStoreList[];

  permissions: SimplifiedPermission[] = [];

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
    if (obj.role != null) {
      this.role = new Role(obj.role);
    }
    if (obj.group != null) {
      this.group = new Group(obj.group);
    }

    if (obj.permissions) {
      this.permissions = obj.permissions.map(p => new SimplifiedPermission(p));
    }

    if (obj.subscribedStoreLists != null) {
      this.subscribedStoreLists = obj.subscribedStoreLists.map((storeList) => new SimplifiedStoreList(storeList));
    }

    if (obj.createdStoreLists != null) {
      this.createdStoreLists = obj.createdStoreLists.map((storeList) => new SimplifiedStoreList(storeList));
    }
  }
}
