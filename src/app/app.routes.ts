import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Twofactor } from './components/twofactor/twofactor';
import { Admin } from './components/admin/admin';
import { Rutas } from './lib/utils/rutas';
import { publicGuard } from './guards/public-guard';
import { logedGuard } from './guards/is-logged-guard';
import { Profile } from './components/profile/profile';
import { Desubscribe } from './components/desubscribe/desubscribe';
import { Notfound } from './components/ui/notfound/notfound';
import { Correosenviados } from './components/correosenviados/correosenviados';

export const routes: Routes = [
  {
    path: Rutas.HOME,
    component: Home,
  },
  {
    path: Rutas.UNSUBSCRIBE,
    component: Desubscribe,
  },
  {
    path: Rutas.LOGIN,
    component: Login,
    canActivate: [publicGuard],
  },
  {
    path: Rutas.LOGIN2FA,
    component: Twofactor,
    canActivate: [publicGuard],
  },
  {
    path: Rutas.ADMIN,
    component: Admin,
    canActivate: [logedGuard],
  },
  {
    path: Rutas.CORREOSENVIADOS,
    component: Correosenviados,
    canActivate: [logedGuard],
  },
  {
    path: Rutas.PROFILE,
    component: Profile,
    canActivate: [logedGuard],
  },
  {
    path: Rutas.NOT_FOUND,
    component: Notfound,
    pathMatch: 'full',
  },
];
