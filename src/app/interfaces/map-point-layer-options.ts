import { Mappable } from './mappable';

export interface MapPointLayerOptions {
  getMappableIsDraggable: (mappable: Mappable) => boolean;
  getMappableIcon: (mappable: Mappable) => any;
  getMappableLabel: (mappable: Mappable) => string;
}
