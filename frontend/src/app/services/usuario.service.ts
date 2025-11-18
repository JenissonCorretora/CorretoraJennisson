import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface Usuario {
  id: number;
  email: string;
  senha?: string; // Não deve ser enviado em requisições GET
  stream_user_id: string;
  telefone?: string;
  created_at?: string;
  updated_at?: string;
  favoritos?: any[];
}

export interface CreateUsuarioRequest {
  email: string;
  senha: string;
  stream_user_id: string;
  telefone?: string;
}

export interface UpdateUsuarioRequest {
  email?: string;
  telefone?: string;
  stream_user_id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.usuarios}`;

  constructor(private http: HttpClient) {}

  /**
   * Obtém todos os usuários (requer autenticação)
   */
  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl);
  }

  /**
   * Obtém um usuário por ID (requer autenticação)
   */
  getById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtém um usuário por email
   */
  getByEmail(email: string): Observable<Usuario> {
    const params = new HttpParams().set('email', email);
    return this.http.get<Usuario>(`${this.baseUrl}/filter/email`, { params });
  }

  /**
   * Obtém um usuário por Stream User ID
   */
  getByStreamUserId(streamUserId: string): Observable<Usuario> {
    const params = new HttpParams().set('streamUserId', streamUserId);
    return this.http.get<Usuario>(`${this.baseUrl}/filter/stream-user-id`, { params });
  }

  /**
   * Cria um novo usuário (registro público)
   */
  create(usuario: CreateUsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, usuario);
  }

  /**
   * Atualiza um usuário (requer autenticação)
   */
  update(id: number, usuario: UpdateUsuarioRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, usuario);
  }

  /**
   * Deleta um usuário (requer autenticação)
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Verifica se um email já está cadastrado
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      await this.getByEmail(email).toPromise();
      return true;
    } catch (error: any) {
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }
}

