import { SimplifiedStore } from '../models/simplified/simplified-store';
import { Color } from '../core/functionalEnums/Color';
import { MarkerShape } from '../core/functionalEnums/MarkerShape';
import { MapService } from '../core/services/map.service';
import MarkerLabel = google.maps.MarkerLabel;

export class StoreIconProvider {
	protected readonly mapService;
	private readonly HIGH_ZOOM = 13;

	constructor(mapService: MapService) {
		this.mapService = mapService;
	}

	getIcon(
		store: SimplifiedStore,
		draggable: boolean,
		selected: boolean,
		assigned: boolean,
		assignedToSelf: boolean
	): string | google.maps.Icon | google.maps.Symbol {
		const fillColor = this.getFillColor(store, draggable, selected, assigned, assignedToSelf);
		const strokeColor = this.getStrokeColor(draggable, selected);
		const shape = this.getShape(store);
		const scale = this.getScale(store);
		const anchor = this.getAnchor(store);
		const strokeWeight = this.getStrokeWeight(store);
		const fillOpacity = 1;
		const rotation = this.getRotation(store);
		const labelOrigin = this.getLabelOrigin(store, rotation);

		return {
			path: shape,
			fillColor: fillColor,
			fillOpacity: fillOpacity,
			scale: scale,
			strokeColor: strokeColor,
			strokeWeight: strokeWeight,
			anchor: anchor,
			labelOrigin: labelOrigin,
			rotation: rotation
		};
	}

	public getLabel(store: SimplifiedStore): string | MarkerLabel {
		const zoom = this.mapService.getZoom();
		let labelColor = Color.WHITE;
		let label: string;

		// User Banner name if available
		// if (this.store.banner) {
		//   label = this.store.banner.bannerName;
		// } else
		if (store.storeName) {
			label = store.storeName;
		} else {
			label = '?';
		}

		// At High Zoom, show full label
		if (zoom > this.HIGH_ZOOM) {
			const mapTypeId = this.mapService.getMap().getMapTypeId();
			if (mapTypeId === google.maps.MapTypeId.SATELLITE || mapTypeId === google.maps.MapTypeId.HYBRID) {
				labelColor = Color.WHITE;
			} else {
				labelColor = Color.BLACK;
			}
		} else {
			labelColor = Color.WHITE;
			label = label[0];
		}

		return {
			color: labelColor,
			fontWeight: 'bold',
			text: label
		};
	}

	protected getFillColor(
		store: SimplifiedStore,
		draggable: boolean,
		selected: boolean,
		assigned: boolean,
		assignedToSelf: boolean
	): string {
		if (draggable) {
			return Color.PURPLE;
		}
		if (assigned) {
			if (assignedToSelf) {
				if (selected) {
					return Color.GREEN_DARK;
				} else {
					return Color.GREEN;
				}
			} else {
				if (selected) {
					return Color.RED_DARK;
				} else {
					return Color.RED;
				}
			}
		}
		if (selected) {
			return Color.BLUE_DARK;
		} else {
			return Color.BLUE;
		}
	}

	private getStrokeColor(draggable: boolean, selected: boolean) {
		if (draggable) {
			return Color.PURPLE_DARK;
		}
		return selected ? Color.YELLOW : Color.WHITE;
	}

	protected getShape(store: SimplifiedStore): MarkerShape {
		if (store.floating) {
			return MarkerShape.LIFE_RING;
		} else if (store.site.duplicate) {
			return MarkerShape.FLAGGED;
		}
		return MarkerShape.FILLED;
	}

	protected getScale(store: SimplifiedStore): number {
		if (store.floating) {
			return 0.06;
		}
		if (store.storeType === 'HISTORICAL' || store.storeType === 'FUTURE') {
			return 0.05;
		}
		return 0.075;
	}

	protected getAnchor(store: SimplifiedStore) {
		const bottom = 510;
		if (store.site.duplicate) {
			return new google.maps.Point(80, bottom);
		}
		return new google.maps.Point(255, bottom);
	}

	protected getStrokeWeight(store: SimplifiedStore) {
		if (store.floating) {
			return 1.2;
		}
		return 2.5;
	}

	private getRotation(store: SimplifiedStore) {
		if (store.storeType === 'HISTORICAL') {
			return -90;
		} else if (store.storeType === 'FUTURE') {
			return 90;
		}
		return 0;
	}

	private getLabelOrigin(store: SimplifiedStore, rotation: number) {
		if (rotation !== 0) {
			console.log('CUSTOM LABEL FOR ', store.storeName);
		}

		let x = 255;
		let y = 230;

		if (store.site.duplicate) {
			y = 238;
		}
		if (store.storeType === 'HISTORICAL' || store.storeType === 'FUTURE') {
			y = 190;
		}

		const zoom = this.mapService.getZoom();
		if (zoom > this.HIGH_ZOOM) {
			if (store.storeType === 'HISTORICAL') {
				x = -120;
				y = 0;
			} else if (store.storeType === 'FUTURE') {
				y = -255;
			} else {
				y = -180;
			}

			if (rotation !== 0) {
				x = rotation === 90 ? -200 : 600;
				y = 100;
			}
		}

		console.log(x, y);

		// if (store.site.duplicate) {
		// 	return new google.maps.Point(255, 238);
		// }
		// if (store.storeType === 'HISTORICAL' || store.storeType === 'FUTURE') {
		//   return new google.maps.Point(255, 190);
		// }
		// const zoom = this.mapService.getZoom();
		// if (zoom > this.HIGH_ZOOM) {
		// 	if (store.storeType === 'HISTORICAL') {
		// 		return new google.maps.Point(-120, 0);
		// 	} else if (store.storeType === 'FUTURE') {
		// 		return new google.maps.Point(255, -255);
		// 	}
		// 	return new google.maps.Point(255, -80);
		// }
		// return new google.maps.Point(255, 230);

		return new google.maps.Point(x, y);
	}
}
