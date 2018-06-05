import { AuditingEntity } from './auditing-entity';

export class StoreVolume extends AuditingEntity {

  volumeTotal: number;
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
  volumePlusMinus: number;
  volumeNote: string;
  volumeConfidence: string;
  legacyCasingId: number;

  constructor(obj) {
    super(obj);

    this.volumeTotal = obj.volumeTotal;

    if (typeof obj.volumeDate === 'string') {
      obj.volumeDate = obj.volumeDate + ' GMT-0600';
    }
    this.volumeDate = new Date(obj.volumeDate);

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
    this.volumePlusMinus = obj.volumePlusMinus;
    this.volumeNote = obj.volumeNote;
    this.volumeConfidence = obj.volumeConfidence;
    this.legacyCasingId = obj.legacyCasingId;
  }
}
