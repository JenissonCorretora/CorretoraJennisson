import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export enum RemetenteTipo {
  Usuario = 1,
  Administrador = 2
}

export interface Mensagem {
  id: number;
  usuario_Id: number;
  usuario_Email?: string;
  administrador_Id?: number;
  administrador_Nome?: string;
  conteudo: string;
  remetente_Tipo: RemetenteTipo;
  lida: boolean;
  created_At: string;
}

export interface CreateMensagemRequest {
  conteudo: string;
}

export interface Conversa {
  usuarioId: number;
  usuarioEmail: string;
  usuarioTelefone?: string;
  usuarioNome: string;
  ultimaMensagem?: Mensagem;
  assunto?: string;
  naoLidas: number;
  mensagens: Mensagem[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.mensagens}`;

  constructor(private http: HttpClient) {}

  /**
   * Obtém todas as mensagens (admin vê todas, usuário vê apenas as suas)
   */
  getAll(): Observable<Mensagem[]> {
    return this.http.get<Mensagem[]>(this.baseUrl);
  }

  /**
   * Obtém mensagem por ID
   */
  getById(id: number): Observable<Mensagem> {
    return this.http.get<Mensagem>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtém contagem de mensagens não lidas (apenas admin)
   */
  getCountNaoLidas(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/nao-lidas`);
  }

  /**
   * Obtém lista de mensagens não lidas (apenas admin)
   */
  getNaoLidas(): Observable<Mensagem[]> {
    return this.http.get<Mensagem[]>(`${this.baseUrl}/nao-lidas/lista`);
  }

  /**
   * Cria uma nova mensagem
   */
  create(request: CreateMensagemRequest): Observable<Mensagem> {
    return this.http.post<Mensagem>(this.baseUrl, request);
  }

  /**
   * Marca mensagem como lida (apenas admin)
   */
  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/ler`, {});
  }
}

