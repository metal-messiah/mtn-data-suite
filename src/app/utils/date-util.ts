export class DateUtil {

  private static timeStampRX = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/;
  private static dateRx = /(\d{4})-(\d{2})-(\d{2})/;

  static getDate(date: string | Date) {
    if (date instanceof Date) {
      return date;
    }

    const timeStampMatch = DateUtil.timeStampRX.exec(date);
    if (timeStampMatch != null) {
      const year = parseInt(timeStampMatch[1], 10);
      const month = parseInt(timeStampMatch[2], 10) - 1;
      const dayOfMonth = parseInt(timeStampMatch[3], 10);
      const hour = parseInt(timeStampMatch[4], 10);
      const minute = parseInt(timeStampMatch[5], 10);
      const second = parseInt(timeStampMatch[6], 10);
      return new Date(year, month, dayOfMonth, hour, minute, second);
    }

    const dateMatch = DateUtil.dateRx.exec(date);
    if (dateMatch != null) {
      const year = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10) - 1;
      const dayOfMonth = parseInt(dateMatch[3], 10);
      return new Date(year, month, dayOfMonth);
    }

    // // Else adjust for time zone
    // const timeZoneDifference = new Date().getTimezoneOffset() * 60 * 1000;
    // const newDate = new Date(date);
    // const adjustedDate = new Date(newDate.getTime() + timeZoneDifference);
    // return adjustedDate;
  }

  static monthsBetween(d1: Date, d2: Date) {
    let diff = (d2.getTime() - d1.getTime()) / 1000;
    diff /= (60 * 60 * 24 * 30.417); // seconds in a month
    return Math.abs(Math.round(diff));
  }

}
