import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Imovel } from './imovel.service';

export interface Favorito {
  id: number;
  usuario_Id: number;
  imovel_Id: number;
  usuario?: any;
  imovel?: Imovel;
}

export interface CreateFavoritoRequest {
  imovelId: number;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritoService {
  private readonly baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.favoritos}`;

  constructor(private http: HttpClient) {}

  /**
   * Obtém todos os favoritos (requer autenticação)
   */
  getAll(): Observable<Favorito[]> {
    return this.http.get<Favorito[]>(this.baseUrl);
  }

  /**
   * Obtém um favorito por ID (requer autenticação)
   */
  getById(id: number): Observable<Favorito> {
    return this.http.get<Favorito>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtém favoritos de um usuário específico (requer autenticação)
   */
  getByUsuarioId(usuarioId: number): Observable<Favorito[]> {
    return this.http.get<Favorito[]>(`${this.baseUrl}/filter/usuario/${usuarioId}`);
  }

  /**
   * Obtém favoritos de um imóvel específico (requer autenticação)
   */
  getByImovelId(imovelId: number): Observable<Favorito[]> {
    return this.http.get<Favorito[]>(`${this.baseUrl}/filter/imovel/${imovelId}`);
  }

  /**
   * Verifica se um imóvel está favoritado por um usuário (requer autenticação)
   */
  getByUsuarioAndImovel(usuarioId: number, imovelId: number): Observable<Favorito | null> {
    return this.http.get<Favorito>(`${this.baseUrl}/filter/usuario/${usuarioId}/imovel/${imovelId}`);
  }

  /**
   * Adiciona um imóvel aos favoritos (requer autenticação)
   */
  add(imovelId: number): Observable<Favorito> {
    const favorito: CreateFavoritoRequest = {
      imovelId
    };
    return this.http.post<Favorito>(this.baseUrl, favorito);
  }

  /**
   * Remove um favorito por ID (requer autenticação)
   */
  remove(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      responseType: 'text'
    }) as Observable<string>;
  }

  /**
   * Remove um favorito por usuário e imóvel (requer autenticação)
   */
  removeByUsuarioAndImovel(usuarioId: number, imovelId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/usuario/${usuarioId}/imovel/${imovelId}`, {
      responseType: 'text'
    }) as Observable<string>;
  }

  /**
   * Verifica se um imóvel está favoritado (método auxiliar)
   */
  async isFavoritado(usuarioId: number, imovelId: number): Promise<boolean> {
    try {
      const favorito = await this.getByUsuarioAndImovel(usuarioId, imovelId).toPromise();
      return favorito !== null && favorito !== undefined;
    } catch (error: any) {
      // Se retornar 404, significa que não está favoritado
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }
}

