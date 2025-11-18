import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard que protege rotas que requerem autenticação
 * Redireciona para login se o usuário não estiver autenticado
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Redireciona para login com a URL de retorno
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

