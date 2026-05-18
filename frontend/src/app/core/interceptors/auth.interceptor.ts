import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Intercepteur global JWT.
 * - Ajoute automatiquement le header Authorization sur toutes les requêtes sortantes.
 * - Redirige vers /auth/login en cas de 401 (token expiré ou invalide).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token  = localStorage.getItem('access_token');

  // Cloner la requête avec le header si un token existe
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token invalide ou expiré → déconnexion propre
        ['access_token', 'refresh_token', 'role', 'user'].forEach(k => localStorage.removeItem(k));
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};
