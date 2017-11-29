import {Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {CallbackComponent} from './callback/callback.component';
import {UsersComponent} from './users/users.component';
import {RolesComponent} from './roles/roles.component';
import {GroupsComponent} from './groups/groups.component';
import {UserDetailComponent} from './user-detail/user-detail.component';
import {PathNotFoundComponent} from './path-not-found/path-not-found.component';
import {RoleDetailComponent} from 'app/role-detail/role-detail.component';

export const ROUTES: Routes = [
  {path: '', component: HomeComponent},
  {path: 'home', redirectTo: '/'},
  {path: 'users', component: UsersComponent},
  {path: 'roles', component: RolesComponent},
  {path: 'role-detail/:id', component: RoleDetailComponent},
  {path: 'role-detail', component: RoleDetailComponent},
  {path: 'groups', component: GroupsComponent},
  {path: 'user-detail/:id', component: UserDetailComponent},
  {path: 'user-detail', component: UserDetailComponent},
  {path: 'callback', component: CallbackComponent},
  {path: '**', component: PathNotFoundComponent}
  // {path: '**', redirectTo: '/'}
];
