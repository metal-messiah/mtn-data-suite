import { DateUtil } from '../../utils/date-util';

export class BannerSourceSummary {
  id: number;
  sourceName: string;
  sourceBannerName: string;
  bannerId: number;
  bannerName: string;
  logoFileName: string;
  matchedStoreSources: number;
  totalStoreSources: number;
  matchingStatus: string;
  validatedDate: Date;
  sourceUrl: string;
  percentComplete: number;

  constructor(obj?) {
    Object.assign(this, obj);
    if (obj.validatedDate) {
      this.validatedDate = DateUtil.getDate(obj.validatedDate);
    }
  }
}
