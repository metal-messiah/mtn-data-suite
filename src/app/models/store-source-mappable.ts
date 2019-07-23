import { Color } from '../core/functionalEnums/Color';
import { MarkerShape } from '../core/functionalEnums/MarkerShape';
import { LatLng } from './latLng';
import { Mappable } from '../interfaces/mappable';
import Icon = google.maps.Icon;
import Symbol = google.maps.Symbol;
import MarkerLabel = google.maps.MarkerLabel;

export class StoreSourceMappable implements Mappable {
    private readonly coordinates: LatLng;
    private draggable: boolean;
    private defaultIcon: object = {
        path: MarkerShape.CIRCLE,
        fillColor: Color.PURPLE,
        fillOpacity: 0.5,
        scale: 0.5,
        strokeColor: Color.PURPLE_DARK,
        strokeWeight: 2.5,
        anchor: new google.maps.Point(50, 50),
        labelOrigin: new google.maps.Point(255, 230),
        rotation: 0
    };
    private icon: object;

    constructor(coords: LatLng) {
        this.coordinates = coords;
        this.draggable = false;
        this.icon = this.defaultIcon;
    }

    getCoordinates(): LatLng {
        return this.coordinates;
    }

    setDraggable(draggable) {
        this.draggable = draggable;
    }

    isDraggable(): boolean {
        return this.draggable;
    }

    getLabel(): string | MarkerLabel {
        return null;
    }

    getIcon(): string | Icon | Symbol {
        if (this.draggable) {
            return {
                path: MarkerShape.FILLED,
                fillColor: Color.PURPLE_DARK,
                fillOpacity: 1,
                scale: 0.1,
                strokeColor: Color.WHITE,
                strokeWeight: 2.5,
                anchor: new google.maps.Point(255, 510),
                labelOrigin: new google.maps.Point(255, 230),
                rotation: 0
            };
        } else {
            return {
                path: MarkerShape.CIRCLE,
                fillColor: Color.PURPLE,
                fillOpacity: 0.5,
                scale: 0.5,
                strokeColor: Color.PURPLE_DARK,
                strokeWeight: 2.5,
                anchor: new google.maps.Point(50, 50),
                labelOrigin: new google.maps.Point(255, 230),
                rotation: 0
            };
        }
    }
}
