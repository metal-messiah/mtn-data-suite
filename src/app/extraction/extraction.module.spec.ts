import { ExtractionModule } from './extraction.module';

describe('ExtractionModule', () => {
  let extractionModule: ExtractionModule;

  beforeEach(() => {
    extractionModule = new ExtractionModule();
  });

  it('should create an instance', () => {
    expect(extractionModule).toBeTruthy();
  });
});
