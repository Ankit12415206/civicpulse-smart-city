import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const allowed: string[] = route.data['roles'];
  if (allowed.includes(auth.getRole() || '')) return true;
  router.navigate(['/login']);
  return false;
};