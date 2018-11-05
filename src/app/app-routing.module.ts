import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { CallbackComponent } from './shared/callback/callback.component';
import { RouterModule, Routes } from '@angular/router';
import { PathNotFoundComponent } from './shared/path-not-found/path-not-found.component';
import { CanDeactivateGuard } from './core/services/can-deactivate.guard';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'home', redirectTo: '/'},
  {path: 'callback', component: CallbackComponent},
  {path: '**', component: PathNotFoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule],
  providers: [CanDeactivateGuard]
})
export class AppRoutingModule {
}
