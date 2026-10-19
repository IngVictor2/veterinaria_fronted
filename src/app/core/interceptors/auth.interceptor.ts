import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let manejar401EnProgreso = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.token();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const esLogout = req.url.includes('/auth/logout');
      if (error.status === 401 && !esLogout && !manejar401EnProgreso) {
        manejar401EnProgreso = true;
        authService.logout();
        router.navigate(['/login']);
        setTimeout(() => (manejar401EnProgreso = false), 500);
      }
      return throwError(() => error);
    }),
  );
};
