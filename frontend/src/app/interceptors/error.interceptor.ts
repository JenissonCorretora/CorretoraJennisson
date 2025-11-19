import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { API_CONFIG } from '../config/api.config';

/**
 * Interceptor que trata erros HTTP globalmente
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Verifica se é um endpoint de autenticação
  const isAuthEndpoint = (url: string) => {
    const authEndpoints = Object.values(API_CONFIG.endpoints.auth);
    return authEndpoints.some(endpoint => url.includes(endpoint));
  };

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Tratamento de erros específicos
      switch (error.status) {
        case 401:
          // Não autorizado - não loga se for endpoint de autenticação (erro esperado no fluxo de login)
          if (!isAuthEndpoint(req.url)) {
            console.warn('Requisição não autorizada. Verifique suas credenciais.');
          }
          // O fluxo de refresh cuidará do logout se necessário
          break;

        case 403:
          // Proibido - usuário não tem permissão
          console.warn('Acesso negado. Você não tem permissão para acessar este recurso.');
          // Pode redirecionar ou mostrar mensagem
          break;

        case 404:
          // Não encontrado - não loga se for verificação de email (comportamento esperado)
          if (error.url && !error.url.includes('/usuario/filter/email')) {
            console.warn('Recurso não encontrado:', error.url);
          }
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

