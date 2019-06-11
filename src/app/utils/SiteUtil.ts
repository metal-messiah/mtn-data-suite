export class SiteUtil {

  static getFormattedPrincipality(site): string {
    let principality = '';
    if (site.city) {
      principality += site.city;
      if (site.state) {
        principality += ', ';
      }
    }
    if (site.state) {
      principality += site.state;
    }
    if (site.postalCode) {
      if (principality.length > 0) {
        principality += ' ';
      }
      principality += site.postalCode;
    }
    return principality;
  }

  static getFormattedIntersection(site): string {
    let intersection = '';
    if (site.quad !== null) {
      intersection += site.quad;
      if (site.intersectionStreetPrimary !== null || site.intersectionStreetSecondary !== null) {
        intersection += ' of ';
      }
    }
    if (site.intersectionStreetPrimary !== null) {
      intersection += site.intersectionStreetPrimary;
      if (site.intersectionStreetSecondary !== null) {
        intersection += ' & ';
      }
    }
    if (site.intersectionStreetSecondary !== null) {
      intersection += site.intersectionStreetSecondary;
    }
    return intersection;
  }

}
