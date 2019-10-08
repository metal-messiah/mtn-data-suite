import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SimplifiedPermission } from '../../models/simplified/simplified-permission';
import { PermissionService } from '../../core/services/permission.service';
import * as _ from 'lodash';

@Component({
  selector: 'mds-permission-table',
  templateUrl: './permission-table.component.html',
  styleUrls: ['./permission-table.component.css']
})
export class PermissionTableComponent implements OnInit, OnChanges {

  form: FormGroup;

  @Input() selectedPermissions: SimplifiedPermission[];

  permissions: SimplifiedPermission[];
  subjects: string[];
  actions = ['CREATE', 'READ', 'UPDATE', 'DELETE'];

  constructor(private permissionService: PermissionService,
              private fb: FormBuilder) {
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.permissionService.getPermissions()
      .subscribe(page => {
        this.permissions = page.content;
        this.createForm();
        if (this.selectedPermissions) {
          this.selectedPermissions.forEach(permission => this.form.get(permission.subject).get(permission.action).setValue(true));
        }
      });
  }

  getSelectedPermissionIds() {
    const selectedPermissions = this.permissions.filter(p => this.form.get([p.subject, p.action]).value);
    return selectedPermissions.map(p => p.id);
  }

  titleCase(str) {
    return str.toLowerCase().split('_').map(function (word) {
      return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
  }

  private createForm() {
    this.form = this.fb.group({});

    this.subjects = _.uniq(this.permissions.map(p => p.subject)).sort();

    // Build groups for each subject including controls for each action
    this.subjects.forEach(subject => {
      const subjectGroup = this.fb.group({});

      // CRUD
      this.actions.forEach(action => {
        const permission = this.permissions.find(p => p.subject === subject && p.action === action);
        if (permission) {
          subjectGroup.addControl(action, this.fb.control(false));
        }
      });

      this.form.addControl(subject, subjectGroup);
    });
  }

}
