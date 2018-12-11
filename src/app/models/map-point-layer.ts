import { Mappable } from '../interfaces/mappable';
import { Subject } from 'rxjs';
import { MapService } from '../core/services/map.service';

/*
  The Map Point Layer should represent a list of Mappables on a map.
  - Mappables is not added to or reduced, but rather replaced (managed externally)
  - Emits marker click events
  - Can be added to and removed from map
 */
export class MapPointLayer<T extends Mappable> {
	protected markers: google.maps.Marker[];
	protected mapService: MapService;

	markerClick$ = new Subject<T>();
	markerDrag$ = new Subject<T>();
	markerDragEnd$ = new Subject();

	constructor(mapService: MapService) {
		this.mapService = mapService;
		this.markers = [];
	}

	protected createMarkersFromMappables(mappables: T[]) {
		mappables.forEach((mappable) => this.createMarkerFromMappable(mappable));
	}

	protected createMarkerFromMappable(mappable: T) {
		const marker = new google.maps.Marker({
			position: mappable.getCoordinates()
		});
		marker.addListener('click', () => this.markerClick$.next(mappable));
		marker.addListener('drag', () => this.markerDrag$.next(mappable));
		marker.addListener('dragend', () => this.markerDragEnd$.next(mappable));

		// Preserve relationship between marker and mappable
		marker.set('mappable', mappable);
		this.markers.push(marker);
		this.setMarkerOptions(marker);
	}

	protected refreshOptionsForMappable(mappable: T): void {
		const marker = this.getMarkerForMappable(mappable);
		if (marker != null) {
			this.setMarkerOptions(marker);
		}
	}

	refreshOptions(): void {
		this.markers.forEach((marker) => this.setMarkerOptions(marker));
	}

	addToMap(map: google.maps.Map) {
		this.markers.forEach((marker) => {
			marker.setMap(map);
		});
	}

	removeFromMap() {
		this.markers.forEach((marker) => marker.setMap(null));
	}

	clearMarkers(): void {
		this.removeFromMap();
		this.markers = [];
	}

	getCoordinatesOfMappableMarker(mappable: T): google.maps.LatLngLiteral {
		const marker = this.getMarkerForMappable(mappable);
		return marker.getPosition().toJSON();
	}

	getMappablesInShape(shape): T[] {
		const mappablesInShape: T[] = [];
		if (shape.type === google.maps.drawing.OverlayType.CIRCLE) {
			this.markers.forEach((marker) => {
				const cir: google.maps.Circle = shape.overlay;
				if (
					cir.getBounds().contains(marker.getPosition()) &&
					google.maps.geometry.spherical.computeDistanceBetween(cir.getCenter(), marker.getPosition()) <=
						cir.getRadius()
				) {
					mappablesInShape.push(marker.get('mappable'));
				}
			});
		} else if (shape.type === google.maps.drawing.OverlayType.POLYGON) {
			this.markers.forEach((marker) => {
				if (google.maps.geometry.poly.containsLocation(marker.getPosition(), shape.overlay)) {
					mappablesInShape.push(marker.get('mappable'));
				}
			});
		} else if (shape.type === google.maps.drawing.OverlayType.RECTANGLE) {
			this.markers.forEach((marker) => {
				if (shape.overlay.getBounds().contains(marker.getPosition())) {
					mappablesInShape.push(marker.get('mappable'));
				}
			});
		} else {
			console.error('Drawing Geometry type not detected!');
		}
		return mappablesInShape;
	}

	protected resetPositionOfMappable(mappable: T) {
		const marker = this.getMarkerForMappable(mappable);
		marker.setPosition(mappable.getCoordinates());
	}

	protected getMarkerForMappable(mappable: T) {
		return this.markers.find((marker) => marker.get('mappable') === mappable);
	}

	protected setMarkerOptions(marker: google.maps.Marker): void {
		const mappable: Mappable = marker.get('mappable');
		marker.setDraggable(mappable.isDraggable());
		marker.setIcon(mappable.getIcon());
		marker.setLabel(mappable.getLabel());
	}
}
