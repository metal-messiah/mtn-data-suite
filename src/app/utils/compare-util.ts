export class CompareUtil {

  static compareStrings(a: string, b: string, desc: boolean = false) {
    if (a && !b) {
      return desc ? 1 : -1;
    }
    if (b && !a) {
      return desc ? -1 : 1;
    }
    if (!a && !b) {
      return 0;
    }
    const result = a.localeCompare(b);
    return desc ? -1 * result : result;
  }
}
