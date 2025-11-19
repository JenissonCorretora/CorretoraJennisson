import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor que adiciona o token JWT automaticamente em todas as requisições
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Verifica se é um endpoint de autenticação (login, refresh token)
  const isAuthEndpoint = (url: string) => {
    const authEndpoints = Object.values(API_CONFIG.endpoints.auth);
    return authEndpoints.some(endpoint => url.includes(endpoint));
  };

  const isAuthRequest = isAuthEndpoint(req.url);
  const token = authService.getAccessToken();
  let clonedRequest = req;

  // NÃO adiciona token em requisições de autenticação (login, refresh)
  // Se houver token E não for requisição de autenticação, adiciona no header Authorization
  if (token && !isAuthRequest) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedRequest).pipe(
    catchError(error => {
      // NÃO tenta fazer refresh token em requisições de autenticação
      // Se for 401 em endpoint de autenticação, apenas propaga o erro
      if (error.status === 401 && !isAuthRequest) {
        // Tenta renovar o token apenas se não for uma requisição de autenticação
        return authService.refreshAccessToken().pipe(
          switchMap((newToken) => {
            // Se o refresh for bem-sucedido, repete a requisição original com o novo token
            // refreshAccessToken retorna Observable<string> (o token diretamente)
            const newClonedRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(newClonedRequest);
          }),
          catchError((refreshError) => {
            // Se o refresh falhar, propaga o erro (AuthService já faz logout)
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};

