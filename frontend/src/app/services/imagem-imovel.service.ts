import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface ImagemImovel {
  id: number;
  imovel_Id: number;
  url: string;
  imovel?: any;
}

export interface CreateImagemImovelRequest {
  imovel_Id: number;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImagemImovelService {
  private readonly baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.imagens}`;

  constructor(private http: HttpClient) {}

  /**
   * Obtém todas as imagens
   */
  getAll(): Observable<ImagemImovel[]> {
    return this.http.get<ImagemImovel[]>(this.baseUrl);
  }

  /**
   * Obtém uma imagem por ID
   */
  getById(id: number): Observable<ImagemImovel> {
    return this.http.get<ImagemImovel>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtém todas as imagens de um imóvel
   */
  getByImovelId(imovelId: number): Observable<ImagemImovel[]> {
    return this.http.get<ImagemImovel[]>(`${this.baseUrl}/filter/imovel/${imovelId}`);
  }

  /**
   * Cria uma nova imagem (requer autenticação admin)
   */
  create(imagem: CreateImagemImovelRequest): Observable<ImagemImovel> {
    return this.http.post<ImagemImovel>(this.baseUrl, imagem);
  }

  /**
   * Atualiza uma imagem (requer autenticação admin)
   */
  update(id: number, imagem: Partial<CreateImagemImovelRequest>): Observable<ImagemImovel> {
    return this.http.put<ImagemImovel>(`${this.baseUrl}/${id}`, imagem);
  }

  /**
   * Deleta uma imagem (requer autenticação admin)
   */
  delete(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      responseType: 'text'
    }) as Observable<string>;
  }

  /**
   * Deleta todas as imagens de um imóvel (requer autenticação admin)
   */
  deleteByImovelId(imovelId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/imovel/${imovelId}`, {
      responseType: 'text'
    }) as Observable<string>;
  }

  /**
   * Faz upload de uma imagem para um imóvel (requer autenticação admin)
   * @param imovelId ID do imóvel
   * @param file Arquivo de imagem
   */
  upload(imovelId: number, file: File): Observable<ImagemImovel> {
    const formData = new FormData();
    formData.append('arquivo', file);

    return this.http.post<ImagemImovel>(
      `${this.baseUrl}/${imovelId}/upload`,
      formData
    );
  }

  /**
   * Faz upload de múltiplas imagens para um imóvel (requer autenticação admin)
   * @param imovelId ID do imóvel
   * @param files Array de arquivos de imagem
   */
  uploadMultiple(imovelId: number, files: File[]): Observable<ImagemImovel[]> {
    const uploads = files.map(file => this.upload(imovelId, file));

    // Retorna um array de observables que podem ser combinados
    // O componente pode usar forkJoin para aguardar todos os uploads
    return new Observable(observer => {
      const results: ImagemImovel[] = [];
      let completed = 0;
      let hasError = false;

      uploads.forEach((upload$, index) => {
        upload$.subscribe({
          next: (result) => {
            results[index] = result;
            completed++;
            if (completed === files.length && !hasError) {
              observer.next(results);
              observer.complete();
            }
          },
          error: (error) => {
            if (!hasError) {
              hasError = true;
              observer.error(error);
            }
          }
        });
      });
    });
  }
}

