import { Component, OnInit } from '@angular/core';
import { GroupService } from '../../core/services/group.service';
import { Router } from '@angular/router';
import { SimplifiedGroup } from '../../models/simplified/simplified-group';
import { ErrorService } from '../../core/services/error.service';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/internal/operators';
import { Sort } from '@angular/material';
import { CompareUtil } from '../../utils/compare-util';

@Component({
  selector: 'mds-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css', '../list-view.css']
})
export class GroupsComponent implements OnInit {

  groups: SimplifiedGroup[];

  isLoading = false;

  constructor(private groupService: GroupService,
              private router: Router,
              private _location: Location,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.getGroups();
  }

  sortData(sort: Sort) {
    if (sort.active === 'displayName') {
      this.groups.sort((a, b) => {
        return CompareUtil.compareStrings(a.displayName, b.displayName, sort.direction === 'desc');
      });
    } else {
      this.groups.sort((a, b) => a.id - b.id);
    }
  }

  private getGroups() {
    this.isLoading = true;
    this.groupService.getAllGroups()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(page => this.groups = page.content,
        err => this.errorService.handleServerError(`Failed to retrieve Groups`, err,
          () => this._location.back(),
          () => this.getGroups())
      );
  }
}
