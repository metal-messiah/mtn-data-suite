import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ListManagerService } from '../../list-manager/list-manager.service';
import { EntitySelectionService } from '../../../core/services/entity-selection.service';
import { ListManagerViews } from '../../list-manager/list-manager-views';

@Component({
  selector: 'mds-sidenav-user-lists',
  templateUrl: './sidenav-user-lists.component.html',
  styleUrls: ['./sidenav-user-lists.component.css']
})
export class SidenavUserListsComponent implements OnInit {

  constructor(private router: Router,
              private selectionService: EntitySelectionService,
              private listManagerService: ListManagerService) {
  }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['casing'], {skipLocationChange: true});
  }

  selectAllFromList() {
    this.selectionService.selectByIds({siteIds: [], storeIds: this.listManagerService.selectedStoreList.storeIds});
  }

  getListViewText(): string {
    const {selectedStoreList} = this.listManagerService;
    return `${selectedStoreList.storeCount.toLocaleString()} Stores in ${selectedStoreList.storeListName}`;
  }

}
