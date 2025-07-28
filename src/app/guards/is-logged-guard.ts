import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token';
import { Rutas } from '../lib/utils/rutas';

export const logedGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  if (!tokenService.isLogged()) {
    router.navigate([`/${Rutas.LOGIN}`]);
    return false;
  }
  return true;
};
