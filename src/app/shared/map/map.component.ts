import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {MapService} from '../../core/services/map.service';

@Component({
  selector: 'mds-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {

  map: any;

  @Input() latitude = 0;
  @Input() longitude = 0;
  @Input() zoom = 8;
  @Output() ready = new EventEmitter();

  constructor(private mapService: MapService) {
  }

  ngOnInit() {
    this.mapService.initialize(document.getElementById('map'));
    this.ready.emit('Hooray!');
  }

  ngOnDestroy() {
    this.mapService.destroy();
  }

}
