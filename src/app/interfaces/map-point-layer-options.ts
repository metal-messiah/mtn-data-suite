import { Mappable } from './mappable';

export class MapPointLayerOptions {
  additionToZIndex = 0;
  getMappableIsDraggable: (mappable: Mappable) => boolean;
  getMappableIcon: (mappable: Mappable) => any;
  getMappableLabel: (mappable: Mappable) => string | {color: string, fontWeight: string, text: string};
}
