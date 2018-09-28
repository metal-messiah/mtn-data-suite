import { SimplifiedStore } from '../models/simplified/simplified-store';
import { StoreIconProvider } from './StoreIconProvider';

export class LogoIconProvider extends StoreIconProvider {

  getIcon(store: SimplifiedStore,
          draggable: boolean,
          selected: boolean,
          assigned: boolean,
          assignedToSelf: boolean): string | google.maps.Icon | google.maps.Symbol {
    if (store.banner != null && store.banner.logoFileName != null) {
      return {
        url: `https://res.cloudinary.com/mtn-retail-advisors/image/upload/c_limit,h_20/${store.banner.logoFileName}`
      }
    } else {
      return super.getIcon(store, draggable, selected, assigned, assignedToSelf);
    }
  }

  getLabel(store: SimplifiedStore) {
    return (store.banner != null && store.banner.logoFileName != null) ? null : super.getLabel(store);
  }

}
