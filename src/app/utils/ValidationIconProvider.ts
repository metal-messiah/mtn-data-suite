import { StoreIconProvider } from './StoreIconProvider';
import { SimplifiedStore } from '../models/simplified/simplified-store';
import { MarkerShape } from '../core/functionalEnums/MarkerShape';
import { DateUtil } from './date-util';

export class ValidationIconProvider extends StoreIconProvider {

  readonly gradient = [
    '#ffc511', '#ffb30f', '#ffa313', '#fb921a', '#f68221', '#ef7228',
    '#e6622f', '#dc5435', '#d1463c', '#c53742', '#b72948', '#aa1c4f',
    '#990b56', '#87005d', '#710066', '#59006f', '#3c0078', '#000080'
  ];

  protected getFillColor(store: SimplifiedStore, draggable: boolean, selected: boolean, assigned: boolean, assignedToSelf: boolean) {
    if (store.validatedDate) {
      let age = DateUtil.monthsBetween(new Date(), store.validatedDate);
      if (age > this.gradient.length - 1) {
        age = this.gradient.length - 1;
      }
      return this.gradient[age];
    } else {
      return this.gradient[this.gradient.length - 1]
    }
  }

  getShape(store: SimplifiedStore) {
    if (store.validatedDate) {
      return MarkerShape.CERTIFICATE;
    } else {
      return super.getShape(store);
    }
  }

}
