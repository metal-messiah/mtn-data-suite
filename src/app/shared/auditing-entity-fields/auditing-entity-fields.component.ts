import { Component, Input, OnChanges } from '@angular/core';
import { AuditingEntity } from '../../models/auditing-entity';

@Component({
  selector: 'mds-auditing-entity-fields',
  templateUrl: './auditing-entity-fields.component.html',
  styleUrls: ['./auditing-entity-fields.component.css']
})
export class AuditingEntityFieldsComponent implements OnChanges {

  @Input() entity: AuditingEntity;

  fields = [];

  ngOnChanges() {
    this.fields = [
      {placeholder: 'Created By', value: this.entity.createdBy.email},
      {placeholder: 'Created Date', value: this.entity.createdDate.toLocaleString()},
      {placeholder: 'Updated By', value: this.entity.updatedBy.email},
      {placeholder: 'Updated Date', value: this.entity.updatedDate.toLocaleString()}
    ];
  }

}
