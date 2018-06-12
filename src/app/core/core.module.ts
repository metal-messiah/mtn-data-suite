import { NgModule, Optional, SkipSelf } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "./services/auth.service";
import { ErrorService } from "./services/error.service";
import { RestService } from "./services/rest.service";
import { GroupService } from "./services/group.service";
import { PermissionService } from "./services/permission.service";
import { RoleService } from "./services/role.service";
import { UserProfileService } from "./services/user-profile.service";
import { AuthGuard } from "./services/auth.guard";
import { DetailFormService } from "./services/detail-form.service";
import { EntityListService } from "./services/entity-list.service";
import { SiteService } from "./services/site.service";
import { ProjectService } from "./services/project.service";
import { IconService } from "./services/icon.service";
import { GeocoderService } from "./services/geocoder.service";
import { LabelService } from "./services/label.service";
import { NavigatorService } from "./services/navigator.service";
import { MapService } from "./services/map.service";
import { StoreService } from "./services/store.service";
import { SourceService } from "./services/source.service";
import { PGTokenService } from "./services/pgtoken.service";

@NgModule({
  imports: [CommonModule],
  declarations: [],
  providers: [
    AuthService,
    AuthGuard,
    DetailFormService,
    EntityListService,
    ErrorService,
    GeocoderService,
    GroupService,
    IconService,
    LabelService,
    MapService,
    NavigatorService,
    PermissionService,
    ProjectService,
    RestService,
    RoleService,
    SiteService,
    UserProfileService,
    StoreService,
    SourceService,
    PGTokenService
  ]
})
export class CoreModule {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: CoreModule
  ) {
    if (parentModule) {
      throw new Error(
        "CoreModule is already loaded. Import it in the AppModule only"
      );
    }
  }
}
