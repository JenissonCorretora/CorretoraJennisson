import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
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

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Verifica se o token expirou ao inicializar
    this.checkTokenExpiration();
  }

  /**
   * Realiza login como administrador
   */
  loginAdmin(email: string, senha: string): Observable<LoginResponse> {
    const request: LoginRequest = { email, senha };
    return this.http.post<LoginResponse>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.loginAdmin}`,
      request
    ).pipe(
      tap(response => this.handleLoginSuccess(response)),
      catchError(error => {
        console.error('Erro no login admin:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Realiza login como usuário
   */
  loginUsuario(email: string, senha: string): Observable<LoginResponse> {
    const request: LoginRequest = { email, senha };
    return this.http.post<LoginResponse>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.loginUsuario}`,
      request
    ).pipe(
      tap(response => this.handleLoginSuccess(response)),
      catchError(error => {
        console.error('Erro no login usuário:', error);
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
   * Redireciona após login baseado no role
   */
  private redirectAfterLogin(role: string): void {
    if (role === 'Admin') {
      this.router.navigate(['/admin/imoveis']);
    } else {
      this.router.navigate(['/imoveis']);
    }
  }

  /**
   * Realiza logout
   */
  logout(): void {
    // Remove tokens e dados do usuário
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);

    // Atualiza estado
    this.updateAuthState(false, null);

    // Redireciona para home
    this.router.navigate(['/']);
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
   */
  private checkTokenExpiration(): void {
    if (!this.hasValidToken()) {
      this.logout();
    }
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
  refreshAccessToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('Refresh token não encontrado'));
    }

    return this.http.post<LoginResponse>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.refreshToken}`,
      { refreshToken }
    ).pipe(
      tap(response => {
        this.setAccessToken(response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem(this.refreshTokenKey, response.refreshToken);
        }
      }),
      catchError(error => {
        // Se o refresh falhar, faz logout
        this.logout();
        return throwError(() => error);
      })
    );
  }
}

