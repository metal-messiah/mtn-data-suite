export class ProjectionsTable {
  mapKey: String;
  scenario: String;
  projectedFitImage: Number;
  salesArea: Number;
  year1Ending: Number;
  year2Ending: Number;
  year3Ending: Number;
  comment: String;
  isValid: Boolean;

  constructor() {
    this.mapKey = null;
    this.scenario = null;
    this.projectedFitImage = null;
    this.salesArea = null;
    this.year1Ending = null;
    this.year2Ending = null;
    this.year3Ending = null;
    this.comment = null;
    this.isValid = false;
  }
}
