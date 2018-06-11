import { MdsPage } from './app.po';

describe('MDS App', () => {
  let page: MdsPage;

  beforeEach(() => {
    page = new MdsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    // expect(page.getParagraphText()).toEqual('app works!');
  });
});
