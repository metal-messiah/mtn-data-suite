import { AuditingEntity } from '../auditing-entity';
import { SimplifiedUserProfile } from '../simplified/simplified-user-profile';
import { Banner } from './banner';

export class BannerSource extends AuditingEntity {
	sourceName: string;
	sourceNativeId: string;
	sourceUrl: string;
	sourceBannerName: string;
	sourceCreatedDate: Date;
	sourceEditedDate: Date;
	sourceDeletedDate: Date;
	// Will be updated by web service if param validated = true
	readonly validatedBy: SimplifiedUserProfile;
	readonly validatedDate: Date;

	banner: Banner;

	constructor(obj?) {
		super(obj);
		Object.assign(this, obj);
	}
}
