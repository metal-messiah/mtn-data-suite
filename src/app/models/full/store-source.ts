import { AuditingEntity } from '../auditing-entity';
import { SimplifiedUserProfile } from '../simplified/simplified-user-profile';
import { SimplifiedStore } from '../simplified/simplified-store';

export class StoreSource extends AuditingEntity {

  sourceName: string;
  sourceNativeId: string;
  sourceUrl: string;
  sourceStoreName: string;
  sourceCreatedDate: Date;
  sourceEditedDate: Date;
  store: SimplifiedStore;

  // Will be updated by web service if param validated = true
  readonly validatedBy: SimplifiedUserProfile;
  readonly validatedDate: Date;

  readonly legacySourceId: number;

  constructor(obj?) {
    super(obj);
    Object.assign(this, obj);
  }
}
