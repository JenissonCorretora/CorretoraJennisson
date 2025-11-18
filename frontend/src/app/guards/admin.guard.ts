import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard que protege rotas que requerem permissão de administrador
 * Redireciona para home se o usuário não for admin
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica se está autenticado
  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // Verifica se é admin
  if (authService.isUserAdmin()) {
    return true;
  }

  // Se não for admin, redireciona para home
  router.navigate(['/']);
  return false;
};

