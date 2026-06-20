import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/parking.model';

/**
 * Guard que restringe el acceso según el rol del usuario.
 * Se configura en las rutas con `data: { role: 'conductor' }` o `data: { role: 'propietario' }`.
 * Asume que authGuard ya verificó que hay sesión iniciada.
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['role'] as User['role'] | undefined;
  if (!requiredRole) return true; // Sin restricción de rol definida

  let currentUser: User | null = null;
  authService.getCurrentUser().subscribe(u => currentUser = u).unsubscribe();

  if (currentUser && (currentUser as User).role === requiredRole) {
    return true;
  }

  // El usuario está logueado pero con el rol equivocado: lo mandamos a su zona correspondiente
  if (currentUser) {
    const homeForRole = (currentUser as User).role === 'propietario' ? '/dashboard-propietario' : '/';
    router.navigate([homeForRole], { queryParams: { accesoDenegado: requiredRole } });
    return false;
  }

  // No debería llegar aquí si authGuard corre antes, pero por seguridad:
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
