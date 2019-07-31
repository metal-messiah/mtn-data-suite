import { Component, ElementRef, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MapService } from '../../core/services/map.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'mds-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {

  @Input() latitude = 0;
  @Input() longitude = 0;
  @Input() zoom = 8;

  @Output() ready = new Subject<google.maps.Map>();

  constructor(private mapService: MapService,
              private host: ElementRef) {
  }


  ngOnInit() {
    const gMap = this.mapService.initialize(this.host.nativeElement);
    this.ready.next(gMap);
  }

  ngOnDestroy() {
    this.mapService.destroy();
  }

}
