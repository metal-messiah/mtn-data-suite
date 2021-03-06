import { AuditingEntity } from '../auditing-entity';
import { SimplifiedUserProfile } from '../simplified/simplified-user-profile';
import { SimplifiedBanner } from '../simplified/simplified-banner';

export class BannerSource extends AuditingEntity {
  id: number;
  createdBy: SimplifiedUserProfile;
  createdDate: Date;
  updatedBy: SimplifiedUserProfile;
  updatedDate: Date;
  version: number;
  sourceName: string;
  sourceNativeId: number;
  sourceUrl: string;
  sourceBannerName: string;
  sourceCreatedDate: Date;
  sourceEditedDate: Date;
  sourceDeletedDate: Date;
  validatedDate: Date;
  validatedBy: SimplifiedUserProfile;
  banner: SimplifiedBanner;

  constructor(obj?) {
    super(obj);
    Object.assign(this, obj);
  }
}
