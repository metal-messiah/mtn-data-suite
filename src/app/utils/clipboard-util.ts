export class ClipboardUtil {

  static copyValueToClipboard(value: string) {
    const selBox = document.createElement('textarea');
    selBox.value = value;
    document.body.appendChild(selBox);
    selBox.select();
    document.execCommand('copy');
    selBox.remove();
  }

}
