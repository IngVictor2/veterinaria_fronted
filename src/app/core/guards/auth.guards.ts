import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }
  return true;
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }
  return true;
};

export const permisosGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const modulos = route.data['modulos'] as string[] | undefined;
  if (modulos && !authService.hasAnyModule(...modulos)) {
    return router.createUrlTree(['/']);
  }

  const roles = route.data['roles'] as string[] | undefined;
  if (roles && !authService.hasAnyRole(...roles)) {
    return router.createUrlTree(['/']);
  }

  return true;
};
