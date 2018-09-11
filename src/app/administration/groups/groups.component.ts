import { Component, OnInit } from '@angular/core';

import { Group } from '../../models/full/group';
import { BasicEntityListComponent } from '../../interfaces/basic-entity-list-component';
import { GroupService } from '../../core/services/group.service';
import { EntityListService } from '../../core/services/entity-list.service';
import { Router } from '@angular/router';
import { SimplifiedGroup } from '../../models/simplified/simplified-group';
import { ErrorService } from '../../core/services/error.service';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/internal/operators';

@Component({
  selector: 'mds-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit, BasicEntityListComponent<Group> {

  groups: SimplifiedGroup[];
  isLoading = false;
  isDeleting = false;

  constructor(private groupService: GroupService,
              private router: Router,
              private _location: Location,
              private els: EntityListService<Group>,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.els.initialize(this);
  }


  loadEntities(): void {
    this.groupService.getAllGroups()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(
        pageable => this.groups = pageable.content.sort(this.sortCompare),
        err => this.errorService.handleServerError(`Failed to retrieve Groups`, err,
          () => this.goBack(),
          () => this.els.initialize(this))
      );
  };

  confirmDelete(group: Group) {
    this.els.confirmDelete(this, group);
  }

  goBack() {
    this._location.back();
  };

  getPluralTypeName(): string {
    return 'groups';
  }

  getEntityService(): GroupService {
    return this.groupService;
  }

  getTypeName(): string {
    return 'group';
  }

  sortCompare(a: Group, b: Group): number {
    return a.displayName.localeCompare(b.displayName);
  }

}
