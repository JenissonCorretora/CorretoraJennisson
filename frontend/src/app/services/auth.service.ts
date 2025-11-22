import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError, filter, take, map, finalize, switchMap } from 'rxjs';
import { API_CONFIG, STORAGE_KEYS } from '../config/api.config';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: number;
  email: string;
  role: string;
}

export interface UserData {
  userId: number;
  email: string;
  role: string;
}

export interface UserTypeResponse {
  userType: string; // "Admin" ou "User"
  exists: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly accessTokenKey = STORAGE_KEYS.accessToken;
  private readonly refreshTokenKey = STORAGE_KEYS.refreshToken;
  private readonly userKey = STORAGE_KEYS.user;

  // Estado de autenticação
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Dados do usuário
  private userSubject = new BehaviorSubject<UserData | null>(this.getUserFromStorage());
  public user$ = this.userSubject.asObservable();

  // Signals para uso em componentes
  public isAuthenticated = signal(this.hasValidToken());
  public currentUser = signal<UserData | null>(this.getUserFromStorage());
  public isAdmin = computed(() => this.currentUser()?.role === 'Admin');

  // Controle de refresh token
  private refreshInProgress = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Verifica se o token expirou ao inicializar
    this.checkTokenExpiration();
  }

  /**
   * Identifica o tipo de usuário (Admin ou User) baseado no email
   */
  identifyUserType(email: string): Observable<UserTypeResponse> {
    return this.http.get<UserTypeResponse>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.identifyUserType}`,
      { params: { email } }
    );
  }

  /**
   * Realiza login automaticamente identificando o tipo de usuário
   */
  login(email: string, senha: string): Observable<LoginResponse> {
    console.log(`[AuthService.login] Iniciando login para email: '${email}'`);

    return this.identifyUserType(email).pipe(
      switchMap((userTypeResponse) => {
        console.log(`[AuthService.login] IdentifyUserType retornou:`, userTypeResponse);

        if (!userTypeResponse.exists) {
          console.error(`[AuthService.login] Email não encontrado no sistema`);
          return throwError(() => new Error('Email não encontrado no sistema'));
        }

        if (userTypeResponse.userType === 'Admin') {
          console.log(`[AuthService.login] Identificado como Admin, chamando loginAdmin`);
          return this.loginAdmin(email, senha);
        } else if (userTypeResponse.userType === 'User') {
          console.log(`[AuthService.login] Identificado como User, chamando loginUsuario`);
          return this.loginUsuario(email, senha);
        } else {
          console.error(`[AuthService.login] Tipo de usuário desconhecido: '${userTypeResponse.userType}'`);
          return throwError(() => new Error(`Tipo de usuário desconhecido: ${userTypeResponse.userType}`));
        }
      }),
      catchError(error => {
        console.error(`[AuthService.login] ERRO no processo de login:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Realiza login como administrador
   * @param silent Se true, não loga erros no console (útil para tentativas automáticas)
   */
  loginAdmin(email: string, senha: string, silent: boolean = false): Observable<LoginResponse> {
    const request: LoginRequest = { email, senha };
    return this.http.post<LoginResponse>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.loginAdmin}`,
      request
    ).pipe(
      tap(response => this.handleLoginSuccess(response)),
      catchError(error => {
        // Só loga o erro se não for uma tentativa silenciosa
        if (!silent) {
          console.error('Erro no login admin:', error);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Realiza login como usuário
   * @param silent Se true, não loga erros no console (útil para tentativas automáticas)
   */
  loginUsuario(email: string, senha: string, silent: boolean = false): Observable<LoginResponse> {
    const request: LoginRequest = { email, senha };
    return this.http.post<LoginResponse>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.loginUsuario}`,
      request
    ).pipe(
      tap(response => this.handleLoginSuccess(response)),
      catchError(error => {
        // Só loga o erro se não for uma tentativa silenciosa
        if (!silent) {
          console.error('Erro no login usuário:', error);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Processa resposta de login bem-sucedido
   */
  private handleLoginSuccess(response: LoginResponse): void {
    // Salva tokens
    localStorage.setItem(this.accessTokenKey, response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem(this.refreshTokenKey, response.refreshToken);
    }

    // Salva dados do usuário
    const userData: UserData = {
      userId: response.userId,
      email: response.email,
      role: response.role
    };
    localStorage.setItem(this.userKey, JSON.stringify(userData));

    // Atualiza estado
    this.updateAuthState(true, userData);

    // Redireciona baseado no role
    this.redirectAfterLogin(userData.role);
  }

  /**
   * Redireciona após login - sempre para home
   */
  private redirectAfterLogin(role: string): void {
    // Tanto Admin quanto User são redirecionados para home após login
    this.router.navigate(['/']);
  }

  /**
   * Realiza logout completo (limpa estado e redireciona)
   * Use este método quando o usuário faz logout explícito ou quando
   * é necessário redirecionar após limpar a autenticação
   */
  logout(): void {
    console.log('[AuthService.logout] Iniciando logout');

    // Limpa tokens e dados do usuário
    this.clearAuthState();

    console.log('[AuthService.logout] Estado limpo. Redirecionando para home...');

    // Redireciona para home
    this.router.navigate(['/']).then(() => {
      console.log('[AuthService.logout] Logout concluído');
    });
  }

  /**
   * Realiza logout sem redirecionar
   * Útil quando você quer limpar a autenticação mas não redirecionar
   * (por exemplo, quando já está na página de login)
   */
  logoutWithoutRedirect(): void {
    this.clearAuthState();
  }

  /**
   * Obtém o token de acesso
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  /**
   * Obtém o refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Verifica se há um token válido
   */
  hasValidToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    // Verifica se o token não expirou (decodifica JWT básico)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Converte para milissegundos
      return Date.now() < expirationTime;
    } catch {
      return false;
    }
  }

  /**
   * Verifica se o token expirou e limpa se necessário
   * Limpa o estado de autenticação quando o token expira, mas não redireciona automaticamente
   * (evita redirecionamentos indesejados ao acessar rotas públicas)
   * Os guards e interceptors cuidarão do redirecionamento quando necessário
   */
  private checkTokenExpiration(): void {
    if (!this.hasValidToken()) {
      // Limpa tokens e estado quando expirado (desloga silenciosamente)
      this.clearAuthState();
    }
  }

  /**
   * Limpa o estado de autenticação sem redirecionar
   * Usado internamente quando o token expira ou precisa ser limpo
   */
  private clearAuthState(): void {
    console.log('[AuthService.clearAuthState] Limpando estado de autenticação...');

    // Limpa todos os itens de autenticação do localStorage
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);

    // Verifica se foi limpo corretamente
    const hasToken = localStorage.getItem(this.accessTokenKey);
    const hasRefreshToken = localStorage.getItem(this.refreshTokenKey);
    const hasUser = localStorage.getItem(this.userKey);

    if (hasToken || hasRefreshToken || hasUser) {
      console.warn('[AuthService.clearAuthState] AVISO: Alguns dados não foram limpos corretamente!');
      console.warn(`Token: ${hasToken ? 'EXISTE' : 'OK'}, RefreshToken: ${hasRefreshToken ? 'EXISTE' : 'OK'}, User: ${hasUser ? 'EXISTE' : 'OK'}`);
    } else {
      console.log('[AuthService.clearAuthState] Estado limpo com sucesso');
    }

    // Atualiza estado interno
    this.updateAuthState(false, null);
  }

  /**
   * Obtém dados do usuário do storage
   */
  private getUserFromStorage(): UserData | null {
    const userStr = localStorage.getItem(this.userKey);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Atualiza estado de autenticação
   */
  private updateAuthState(isAuthenticated: boolean, user: UserData | null): void {
    this.isAuthenticated.set(isAuthenticated);
    this.currentUser.set(user);
    this.isAuthenticatedSubject.next(isAuthenticated);
    this.userSubject.next(user);
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Verifica se o usuário é admin
   */
  isUserAdmin(): boolean {
    return this.isAdmin();
  }

  /**
   * Obtém dados do usuário atual
   */
  getCurrentUser(): UserData | null {
    return this.currentUser();
  }

  /**
   * Atualiza o token de acesso (usado pelo interceptor)
   */
  setAccessToken(token: string): void {
    localStorage.setItem(this.accessTokenKey, token);
  }

  /**
   * Tenta renovar o token usando refresh token
   */
  refreshAccessToken(): Observable<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('Refresh token não encontrado'));
    }

    if (this.refreshInProgress) {
      return this.refreshTokenSubject.pipe(
        filter((token): token is string => token !== null),
        take(1)
      );
    }

    this.refreshInProgress = true;
    this.refreshTokenSubject.next(null);

    return this.http.post<LoginResponse>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.refreshToken}`,
      { refreshToken }
    ).pipe(
      tap(response => {
        this.setAccessToken(response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem(this.refreshTokenKey, response.refreshToken);
        }
        this.refreshTokenSubject.next(response.accessToken);
        // Mantém estado autenticado
        this.updateAuthState(true, this.currentUser());
      }),
      map(response => response.accessToken),
      catchError(error => {
        this.refreshTokenSubject.next(null);
        this.logout();
        return throwError(() => error);
      }),
      finalize(() => {
        this.refreshInProgress = false;
      })
    );
  }
}

