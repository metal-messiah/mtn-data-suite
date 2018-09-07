import { EntityMapLayer } from './entity-map-layer';
import { AuthService } from '../core/services/auth.service';
import { MapService } from '../core/services/map.service';
import { SiteMappable } from './site-mappable';
import { SimplifiedSite } from './simplified/simplified-site';

export class SiteMapLayer extends EntityMapLayer<SiteMappable> {

  private readonly authService: AuthService;

  constructor(mapService: MapService,
              authService: AuthService) {
    super(mapService, (site: SimplifiedSite): SiteMappable => this.createSiteMappable(site));
    this.authService = authService;
  }

  private createSiteMappable(site: SimplifiedSite): SiteMappable {
    return new SiteMappable(site,
      this.authService.sessionUser.id,
      (s: SimplifiedSite) => this.selectedEntityIds.has(s.id));
  }
}
