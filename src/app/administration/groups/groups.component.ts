import {Component, OnInit} from '@angular/core';

import {Group} from '../../models/group';
import {BasicEntityListComponent} from '../../interfaces/basic-entity-list-component';
import {GroupService} from '../../core/services/group.service';
import {EntityListService} from '../../core/services/entity-list.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit, BasicEntityListComponent<Group> {

  groups: Group[];
  isLoading: false;
  isDeleting: false;

  constructor(private groupService: GroupService,
              private router: Router,
              private els: EntityListService<Group>) {
  }

  ngOnInit() {
    this.els.initialize(this);
  }

  confirmDelete(group: Group) {
    this.els.confirmDelete(this, group);
  }

  goBack() {
    this.router.navigate(['admin']);
  }

  getPluralTypeName(): string {
    return 'groups';
  }

  getEntityService(): GroupService {
    return this.groupService;
  }

  getTypeName(): string {
    return 'group';
  }

  setEntities(groups: Group[]): void {
    this.groups = groups;
  }

  sortCompare(a: Group, b: Group): number {
    return a.displayName.localeCompare(b.displayName);
  }
}
