import { browser, element, by } from 'protractor';

export class MdsPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('mds-root h1')).getText();
  }
}
