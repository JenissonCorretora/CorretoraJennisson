import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export enum StatusImovel {
  Disponivel = 'Disponivel',
  Vendido = 'Vendido',
  Alugado = 'Alugado'
}

export type TipoImovel = string;

export const DEFAULT_TIPOS_IMOVEL: string[] = ['Casa', 'Apartamento', 'Terreno'];

export interface Imovel {
  id: number;
  titulo: string;
  descricao: string;
  cidade: string;
  estado: string;
  endereco: string;
  preco: number;
  status: StatusImovel;
  tipoImovel: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
  imagens?: ImagemImovel[];
  favoritos?: any[];
}

export interface ImagemImovel {
  id: number;
  imovel_Id: number;
  url: string;
}

export interface CreateImovelRequest {
  titulo: string;
  descricao: string;
  cidade: string;
  estado: string;
  endereco: string;
  preco: number;
  status: StatusImovel;
  tipoImovel: string;
  ativo?: boolean;
}

export interface UpdateImovelRequest extends Partial<CreateImovelRequest> {
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImovelService {
  private readonly baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.imoveis}`;

  constructor(private http: HttpClient) {}

  /**
   * Obtém todos os imóveis
   */
  getAll(): Observable<Imovel[]> {
    return this.http.get<Imovel[]>(this.baseUrl);
  }

  /**
   * Obtém um imóvel por ID
   */
  getById(id: number): Observable<Imovel> {
    return this.http.get<Imovel>(`${this.baseUrl}/${id}`);
  }

  /**
   * Cria um novo imóvel (requer autenticação admin)
   */
  create(imovel: CreateImovelRequest): Observable<Imovel> {
    return this.http.post<Imovel>(this.baseUrl, imovel);
  }

  /**
   * Atualiza um imóvel (requer autenticação admin)
   */
  update(id: number, imovel: Partial<CreateImovelRequest>): Observable<Imovel> {
    return this.http.put<Imovel>(`${this.baseUrl}/${id}`, imovel);
  }

  /**
   * Atualiza o status ativo/inativo de um imóvel (requer autenticação admin)
   */
  updateAtivo(id: number, ativo: boolean): Observable<Imovel> {
    return this.http.patch<Imovel>(`${this.baseUrl}/${id}/ativo`, { ativo });
  }

  /**
   * Deleta um imóvel (requer autenticação admin)
   */
  delete(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      responseType: 'text'
    }) as Observable<string>;
  }

  /**
   * Filtra imóveis por cidade
   */
  getByCidade(cidade: string): Observable<Imovel[]> {
    const params = new HttpParams().set('cidade', cidade);
    return this.http.get<Imovel[]>(`${this.baseUrl}/filter/cidade`, { params });
  }

  /**
   * Filtra imóveis por tipo
   */
  getByTipo(tipo: string): Observable<Imovel[]> {
    const params = new HttpParams().set('tipo', tipo);
    return this.http.get<Imovel[]>(`${this.baseUrl}/filter/tipo`, { params });
  }

  /**
   * Filtra imóveis por status
   */
  getByStatus(status: StatusImovel): Observable<Imovel[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<Imovel[]>(`${this.baseUrl}/filter/status`, { params });
  }

  /**
   * Filtra imóveis por faixa de preço
   */
  getByPrecoRange(precoMin: number, precoMax: number): Observable<Imovel[]> {
    const params = new HttpParams()
      .set('precoMin', precoMin.toString())
      .set('precoMax', precoMax.toString());
    return this.http.get<Imovel[]>(`${this.baseUrl}/filter/preco`, { params });
  }

  /**
   * Busca combinada com múltiplos filtros
   */
  search(filters: {
    cidade?: string;
    tipo?: string;
    status?: StatusImovel;
    precoMin?: number;
    precoMax?: number;
  }): Observable<Imovel[]> {
    let params = new HttpParams();

    if (filters.cidade) {
      params = params.set('cidade', filters.cidade);
    }
    if (filters.tipo) {
      params = params.set('tipo', filters.tipo);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.precoMin !== undefined) {
      params = params.set('precoMin', filters.precoMin.toString());
    }
    if (filters.precoMax !== undefined) {
      params = params.set('precoMax', filters.precoMax.toString());
    }

    // Se houver filtros, usa a busca combinada
    // Por enquanto, vamos usar getAll e filtrar no frontend
    // Ou podemos criar um endpoint específico no backend
    return this.http.get<Imovel[]>(this.baseUrl, { params });
  }
}

