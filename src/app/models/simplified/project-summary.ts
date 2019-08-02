export class ProjectSummary {

  activeStoresInBounds = 0;
  activeCasedStoresInBounds = 0;
  activeCasedStoresOutOfBounds = 0;
  futureStoresInBounds = 0;
  futureCasedStoresInBounds = 0;
  futureCasedStoresOutOfBounds = 0;
  historicalStoresInBounds = 0;
  historicalCasedStoresInBounds = 0;
  historicalCasedStoresOutOfBounds = 0;

  constructor(obj?) {
    Object.assign(this, obj);
  }
}
