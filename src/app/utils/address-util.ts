export class AddressUtil {

  static getAddressString(address, city, state, postalCode) {
    return [address, city, state, postalCode].filter(p => p && String(p).trim().length > 0).join(', ');
  }

}
