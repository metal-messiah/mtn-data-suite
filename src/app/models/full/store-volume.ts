import { AuditingEntity } from '../auditing-entity';
import { DateUtil } from '../../utils/date-util';

export class StoreVolume extends AuditingEntity {

  volumeTotal: number;
  volumeBoxTotal: number;
  volumeDate: Date;
  volumeType: string;
  source: string;
  volumeGrocery: number;
  volumePercentGrocery: number;
  volumeMeat: number;
  volumePercentMeat: number;
  volumeNonFood: number;
  volumePercentNonFood: number;
  volumeOther: number;
  volumePercentOther: number;
  volumeProduce: number;
  volumePercentProduce: number;
  volumeNote: string;
  volumeConfidence: string;
  legacyCasingId: number;

  constructor(obj) {
    super(obj);

    this.volumeTotal = obj.volumeTotal;
    this.volumeBoxTotal = obj.volumeBoxTotal;

    if (obj.volumeDate != null) {
      this.volumeDate = DateUtil.getDate(obj.volumeDate);
    }

    this.volumeType = obj.volumeType;
    this.source = obj.source;
    this.volumeGrocery = obj.volumeGrocery;
    this.volumePercentGrocery = obj.volumePercentGrocery;
    this.volumeMeat = obj.volumeMeat;
    this.volumePercentMeat = obj.volumePercentMeat;
    this.volumeNonFood = obj.volumeNonFood;
    this.volumePercentNonFood = obj.volumePercentNonFood;
    this.volumeOther = obj.volumeOther;
    this.volumePercentOther = obj.volumePercentOther;
    this.volumeProduce = obj.volumeProduce;
    this.volumePercentProduce = obj.volumePercentProduce;
    this.volumeNote = obj.volumeNote;
    this.volumeConfidence = obj.volumeConfidence;
    this.legacyCasingId = obj.legacyCasingId;
  }
}
