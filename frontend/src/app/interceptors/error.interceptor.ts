import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor que trata erros HTTP globalmente
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Tratamento de erros específicos
      switch (error.status) {
        case 401:
          // Não autorizado - token inválido ou expirado
          console.warn('Token inválido ou expirado. Fazendo logout...');
          authService.logout();
          router.navigate(['/login'], {
            queryParams: { returnUrl: router.url }
          });
          break;

        case 403:
          // Proibido - usuário não tem permissão
          console.warn('Acesso negado. Você não tem permissão para acessar este recurso.');
          // Pode redirecionar ou mostrar mensagem
          break;

        case 404:
          // Não encontrado
          console.warn('Recurso não encontrado:', error.url);
          break;

        case 500:
          // Erro interno do servidor
          console.error('Erro interno do servidor:', error.message);
          break;

        default:
          // Outros erros
          console.error('Erro HTTP:', error.status, error.message);
      }

      // Propaga o erro para que os componentes possam tratá-lo
      return throwError(() => error);
    })
  );
};

