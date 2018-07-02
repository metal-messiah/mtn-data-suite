import { AuditingEntity } from '../auditing-entity';
import { SimplifiedUserProfile } from '../simplified/simplified-user-profile';
import { SimplifiedPermission } from '../simplified/simplified-permission';

export class StoreSource extends AuditingEntity {

  sourceName: string;
  sourceNativeId: string;
  sourceUrl: string;
  legacySourceId: number;
  validatedBy: SimplifiedUserProfile;
  validatedDate: Date;
  sourceStoreName: string;
  sourceCreatedDate: Date;
  sourceEditedDate: Date;

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
  }
}
