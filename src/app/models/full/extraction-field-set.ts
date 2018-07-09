import {AuditingEntity} from '../auditing-entity';

export class ExtractionFieldSet extends AuditingEntity {

  fieldSetName: string;

  constructor(obj) {
    super(obj);
    Object.assign(this, obj);
  }
}
