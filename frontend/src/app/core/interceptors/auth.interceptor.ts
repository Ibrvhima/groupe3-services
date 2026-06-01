import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Intercepteur global JWT.
 * 1. Injecte le header Authorization sur toutes les requêtes.
 * 2. Sur 401 : tente un refresh automatique, puis rejoue la requête.
 * 3. Si le refresh échoue aussi → déconnexion propre + redirect /auth/login.
 */

function clearSession(router: Router): void {
  ['access_token', 'refresh_token', 'role', 'user'].forEach(k => localStorage.removeItem(k));
  router.navigate(['/auth/login']);
}

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router);
  const http   = inject(HttpClient);
  const token  = localStorage.getItem('access_token');

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Ne pas tenter le refresh si on est déjà sur la route de refresh
      // (évite la boucle infinie)
      if (error.status !== 401 || req.url.includes('/refresh/')) {
        return throwError(() => error);
      }

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        clearSession(router);
        return throwError(() => error);
      }

      // Tentative de renouvellement du token
      return http
        .post<{ access: string }>(`${environment.apiUrl}/users/refresh/`, { refresh: refreshToken })
        .pipe(
          switchMap(res => {
            localStorage.setItem('access_token', res.access);
            // Rejoue la requête originale avec le nouveau token
            const retried = req.clone({ setHeaders: { Authorization: `Bearer ${res.access}` } });
            return next(retried);
          }),
          catchError(() => {
            // Refresh invalide ou expiré → déconnexion
            clearSession(router);
            return throwError(() => error);
          }),
        );
    }),
  );
};
