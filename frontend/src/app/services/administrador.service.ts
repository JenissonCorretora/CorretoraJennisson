import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, firstValueFrom, catchError, of } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface Administrador {
  id: number;
  nome: string;
  email: string;
  senha?: string; // Não deve ser enviado em requisições GET
  telefone?: string;
  stream_user_id?: string; // Opcional - para futuro chatbot
  id_PFPJ?: string; // CRECI
  created_at?: string;
  updated_at?: string;
}

export interface CreateAdministradorRequest {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  stream_user_id?: string; // Opcional - comentado conforme solicitado
  id_PFPJ?: string; // CRECI
}

export interface UpdateAdministradorRequest {
  nome?: string;
  email?: string;
  telefone?: string;
  senha?: string;
  stream_user_id?: string;
  id_PFPJ?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {
  private readonly baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.administradores}`;

  constructor(private http: HttpClient) {}

  /**
   * Cria um novo administrador (registro público - sem autenticação)
   */
  create(administrador: CreateAdministradorRequest): Observable<Administrador> {
    return this.http.post<Administrador>(this.baseUrl, administrador);
  }

  /**
   * Obtém um administrador por ID (requer autenticação Admin)
   */
  getById(id: number): Observable<Administrador> {
    return this.http.get<Administrador>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtém um administrador por nome (requer autenticação Admin)
   */
  getByName(nome: string): Observable<Administrador> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<Administrador>(`${this.baseUrl}/filter`, { params });
  }

  /**
   * Obtém um administrador por email
   * Nota: O backend não tem endpoint específico para buscar administrador por email
   * Use emailExists() para verificar se um email já está cadastrado
   */
  getByEmail(email: string): Observable<Administrador | null> {
    // Retorna null pois não há endpoint específico
    // O método emailExists() usa identifyUserType que é mais adequado
    return of(null);
  }

  /**
   * Atualiza um administrador (requer autenticação Admin)
   */
  update(id: number, administrador: UpdateAdministradorRequest): Observable<Administrador> {
    return this.http.put<Administrador>(`${this.baseUrl}/${id}`, administrador);
  }

  /**
   * Deleta um administrador (requer autenticação Admin)
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Verifica se um email já está cadastrado como administrador
   * Usa o endpoint identify-user-type do AuthController
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ userType: string; exists: boolean }>(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.identifyUserType}`,
          { params: { email } }
        ).pipe(
          catchError((error: any) => {
            // Se houver erro, assume que não existe
            console.warn('Erro ao verificar email de administrador:', error);
            return of({ userType: '', exists: false });
          })
        )
      );

      // Verifica se existe e se é Admin
      return response.exists && response.userType === 'Admin';
    } catch (error: any) {
      console.warn('Erro inesperado ao verificar email de administrador:', error);
      return false;
    }
  }
}

