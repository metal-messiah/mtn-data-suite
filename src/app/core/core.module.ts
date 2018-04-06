import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ErrorService } from './services/error.service';
import { RestService } from './services/rest.service';
import { GroupService } from './services/group.service';
import { PermissionService } from './services/permission.service';
import { RoleService } from './services/role.service';
import { UserProfileService } from './services/user.service';
import { AuthGuard } from './services/auth.guard';
import { DetailFormService } from './services/detail-form.service';
import { EntityListService } from './services/entity-list.service';
import { SiteService } from './services/site.service';
import { DuplicateService } from './services/duplicate.service';
import { ProjectService } from './services/project.service';
import { IconService } from './services/icon.service';
import { GeocoderService } from './services/geocoder.service';
import { LabelService } from './services/label.service';
import { NavigatorService } from './services/navigator.service';
import { GooglePlacesService } from './services/google-places.service';
import { MapService } from './services/map.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [
    AuthService,
    AuthGuard,
    DetailFormService,
    DuplicateService,
    EntityListService,
    ErrorService,
    GeocoderService,
    GroupService,
    GooglePlacesService,
    IconService,
    LabelService,
    MapService,
    NavigatorService,
    PermissionService,
    ProjectService,
    RestService,
    RoleService,
    SiteService,
    UserProfileService
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
