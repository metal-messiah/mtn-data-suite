export class DateUtil {

  static getDate(date: string | Date) {
    if (date instanceof Date) {
      return date;
    }
    // Else adjust for time zone
    const timeZoneDifference = new Date().getTimezoneOffset() * 60 * 1000
    return new Date(new Date(date).getTime() + timeZoneDifference);
  }
}
