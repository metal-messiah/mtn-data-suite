import {DatePipe} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {Observable} from 'rxjs/Observable';

import {CanComponentDeactivate} from '../../core/services/can-deactivate.guard';
import {DetailFormService} from '../../core/services/detail-form.service';
import {GroupService} from '../../core/services/group.service';

import {DetailFormComponent} from '../../interfaces/detail-form-component';
import {Group} from '../../models/group';
import {UserProfile} from '../../models/user-profile';
import { SimplifiedGroup } from '../../models/simplified-group';

@Component({
  selector: 'mds-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css']
})
export class GroupDetailComponent implements OnInit, CanComponentDeactivate, DetailFormComponent<Group> {

  groupForm: FormGroup;

  group: Group;

  isSaving = false;
  isLoading = false;

  constructor(private groupService: GroupService,
              private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
              private datePipe: DatePipe,
              private detailFormService: DetailFormService<Group, SimplifiedGroup>) {
  }

  ngOnInit() {
    this.createForm();

    this.isLoading = true;

    this.detailFormService.retrieveObj(this);
  }

  // Implementations for DetailFormComponent
  createForm() {
    this.groupForm = this.fb.group({
      displayName: ['', Validators.required],
      description: '',
      createdBy: '',
      createdDate: '',
      updatedBy: '',
      updatedDate: '',
      members: this.fb.array([]),
      allSelected: true
    });
    this.setDisabledFields();
  }

  setDisabledFields(): void {
    this.groupForm.get('createdBy').disable();
    this.groupForm.get('createdDate').disable();
    this.groupForm.get('updatedBy').disable();
    this.groupForm.get('updatedDate').disable();
  }

  getForm(): FormGroup {
    return this.groupForm;
  }

  getNewObj(): Group {
    return new Group();
  }

  getObj(): Group {
    return this.group;
  }

  getEntityService(): GroupService {
    return this.groupService;
  }

  getRoute(): ActivatedRoute {
    return this.route;
  }

  getSavableObj(): Group {
    const formModel = this.groupForm.value;

    // deep copy of members
    const membersDeepCopy: UserProfile[] = formModel.members.map(
      (member: UserProfile) => Object.assign({}, member)
    );

    return new Group({
      id: this.group.id,
      displayName: formModel.displayName,
      description: formModel.description,
      members: membersDeepCopy,
      createdBy: this.group.createdBy,
      createdDate: this.group.createdDate,
      updatedBy: this.group.updatedBy,
      updatedDate: this.group.updatedDate,
      version: this.group.version,
      jiffy: 'blag'
    });
  }

  getTypeName(): string {
    return 'group';
  }

  goBack() {
    this.router.navigate(['/admin/groups']);
  }

  onObjectChange(): void {
    this.groupForm.reset({
      displayName: this.group.displayName,
      description: this.group.description
    });

    const memberFGs = this.group.members.map(member => this.fb.group(member));
    const memberFormArray = this.fb.array(memberFGs);
    this.groupForm.setControl('members', memberFormArray);

    if (this.group.id !== undefined) {
      this.groupForm.patchValue({
        createdBy: this.group.createdBy.email,
        createdDate: this.datePipe.transform(this.group.createdDate, 'medium'),
        updatedBy: this.group.updatedBy.email,
        updatedDate: this.datePipe.transform(this.group.updatedDate, 'medium'),
      });
    }
  }

  setObj(obj: Group) {
    this.group = obj;
    this.onObjectChange();
  }

  // Delegated functions
  saveGroup() {
    this.detailFormService.save(this);
  }

  canDeactivate(): Observable<boolean> | boolean {
    return this.detailFormService.canDeactivate(this);
  }
}
