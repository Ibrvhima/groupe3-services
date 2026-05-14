import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/auth/login']);
  return false;
};

export const roleGuard = (role: string): CanActivateFn => () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }
  if (auth.getRole() !== role) {
    router.navigate([`/${auth.getRole()}`]);
    return false;
  }
  return true;
};
