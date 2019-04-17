import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MapService } from '../../core/services/map.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'mds-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  map: any;

  @Input() latitude = 0;
  @Input() longitude = 0;
  @Input() zoom = 8;

  @Output() ready = new Subject<google.maps.Map>();

  constructor(private mapService: MapService) {
  }

  ngOnInit() {
    const map = this.mapService.initialize(document.getElementById('map'));
    this.ready.next(map);
  }

  // ngOnDestroy() {
  //   this.mapService.destroy();
  // }

}
