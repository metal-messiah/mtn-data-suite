import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UpdateService } from '../../core/services/update.service';

@Component({
  selector: 'mds-app-info-dialog',
  templateUrl: './app-info-dialog.component.html',
  styleUrls: ['./app-info-dialog.component.css']
})
export class AppInfoDialogComponent implements OnInit {

  version: string;

  constructor(private updateService: UpdateService) { }

  ngOnInit() {
    this.version = environment.VERSION;
  }

  checkForUpdate() {
    this.updateService.checkForUpdate();
  }

}
