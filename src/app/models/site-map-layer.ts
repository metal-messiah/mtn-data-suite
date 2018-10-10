import { EntityMapLayer } from './entity-map-layer';
import { AuthService } from '../core/services/auth.service';
import { MapService } from '../core/services/map.service';
import { SiteMappable } from './site-mappable';
import { SimplifiedSite } from './simplified/simplified-site';
import { EntitySelectionService } from '../core/services/entity-selection.service';

export class SiteMapLayer extends EntityMapLayer<SiteMappable> {

  private readonly authService: AuthService;

  constructor(mapService: MapService,
              authService: AuthService,
              selectedIdSet: Set<number>) {
    super(mapService, (site: SimplifiedSite): SiteMappable => this.createSiteMappable(site), selectedIdSet);
    this.authService = authService;
  }

  private createSiteMappable(site: SimplifiedSite): SiteMappable {
    return new SiteMappable(site,
      this.authService.sessionUser.id,
      (s: SimplifiedSite) => this.selectedEntityIds.has(s.id));
  }
}
