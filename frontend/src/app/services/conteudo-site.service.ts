import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface ConteudoSite {
  id: number;
  chave: string;
  titulo: string;
  subtitulo?: string;
  descricao: string;
  imagemUrl?: string;
  ordem: number;
  ativo: boolean;
  atualizadoEm?: string;
  criadoEm?: string;
}

export interface CreateConteudoSiteRequest {
  chave: string;
  titulo: string;
  subtitulo?: string;
  descricao: string;
  imagemUrl?: string;
  ordem?: number;
  ativo?: boolean;
}

export interface UpdateConteudoSiteRequest extends Partial<CreateConteudoSiteRequest> {
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConteudoSiteService {
  private readonly baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.conteudoSite}`;

  constructor(private http: HttpClient) {}

  /**
   * Obtém todos os conteúdos do site
   * @param incluirInativos Se true, inclui conteúdos inativos
   */
  getAll(incluirInativos: boolean = false): Observable<ConteudoSite[]> {
    const params = new HttpParams().set('incluirInativos', incluirInativos.toString());
    return this.http.get<ConteudoSite[]>(this.baseUrl, { params });
  }

  /**
   * Obtém um conteúdo por ID
   */
  getById(id: number): Observable<ConteudoSite> {
    return this.http.get<ConteudoSite>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtém um conteúdo por chave (útil para buscar conteúdo específico)
   */
  getByChave(chave: string): Observable<ConteudoSite> {
    return this.http.get<ConteudoSite>(`${this.baseUrl}/chave/${chave}`);
  }

  /**
   * Cria um novo conteúdo (requer autenticação admin)
   */
  create(conteudo: CreateConteudoSiteRequest): Observable<ConteudoSite> {
    return this.http.post<ConteudoSite>(this.baseUrl, conteudo);
  }

  /**
   * Atualiza um conteúdo (requer autenticação admin)
   */
  update(id: number, conteudo: Partial<CreateConteudoSiteRequest>): Observable<ConteudoSite> {
    return this.http.put<ConteudoSite>(`${this.baseUrl}/${id}`, conteudo);
  }

  /**
   * Deleta um conteúdo (requer autenticação admin)
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtém apenas conteúdos ativos (método auxiliar)
   */
  getAtivos(): Observable<ConteudoSite[]> {
    return this.getAll(false);
  }
}

