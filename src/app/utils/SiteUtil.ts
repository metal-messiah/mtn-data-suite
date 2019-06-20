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
    if (site.quad && site.quad !== 'NONE') {
      intersection += site.quad;
      if (site.intersectionStreetPrimary || site.intersectionStreetSecondary) {
        intersection += ' of ';
      }
    }
    if (site.intersectionStreetPrimary) {
      intersection += site.intersectionStreetPrimary;
      if (site.intersectionStreetSecondary) {
        intersection += ' & ';
      }
    }
    if (site.intersectionStreetSecondary) {
      intersection += site.intersectionStreetSecondary;
    }
    return intersection;
  }

}
