import { AuditingEntity } from '../auditing-entity';
import { SimplifiedUserProfile } from '../simplified/simplified-user-profile';
import { SimplifiedStore } from '../simplified/simplified-store';
import { SimplifiedBannerSource } from '../simplified/simplified-banner-source';
import { StoreSourceData } from '../simplified/store-source-data';

export class StoreSource extends AuditingEntity {

  sourceName: string;
  sourceNativeId: string;
  sourceUrl: string;
  sourceStoreName: string;
  sourceCreatedDate: Date;
  sourceEditedDate: Date;
  sourceDeletedDate: Date;

  store: SimplifiedStore;
  bannerSource: SimplifiedBannerSource;

  storeSourceData: StoreSourceData;

  // Will be updated by web service if param validated = true
  readonly validatedBy: SimplifiedUserProfile;
  readonly validatedDate: Date;

  readonly legacySourceId: number;

  constructor(obj?) {
    super(obj);
    Object.assign(this, obj);
  }
}
