import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { API_CONFIG } from '../config/api.config';
import { AuthService } from './auth.service';
import { Mensagem } from './chat.service';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection?: signalR.HubConnection;
  public connectionState = signal<signalR.HubConnectionState>(signalR.HubConnectionState.Disconnected);
  public messages = signal<Mensagem[]>([]);
  private messageCallbacks: ((mensagem: Mensagem) => void)[] = [];

  constructor(private authService: AuthService) {}

  /**
   * Inicia a conexão SignalR
   */
  async startConnection(): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const token = this.authService.getAccessToken();
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_CONFIG.endpoints.chatHub}`, {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    // Eventos de conexão
    this.hubConnection.onreconnecting(() => {
      console.log('SignalR reconectando...');
      this.connectionState.set(signalR.HubConnectionState.Reconnecting);
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconectado');
      this.connectionState.set(signalR.HubConnectionState.Connected);
    });

    this.hubConnection.onclose(() => {
      console.log('SignalR desconectado');
      this.connectionState.set(signalR.HubConnectionState.Disconnected);
    });

    // Eventos de mensagens
    this.hubConnection.on('ReceiveMessage', (mensagem: Mensagem) => {
      console.log('SignalR: ReceiveMessage recebida', mensagem);
      const currentMessages = this.messages();
      this.messages.set([mensagem, ...currentMessages]);
      // Notifica callbacks
      this.messageCallbacks.forEach(callback => {
        try {
          callback(mensagem);
        } catch (error) {
          console.error('Erro ao executar callback de mensagem:', error);
        }
      });
    });

    this.hubConnection.on('MessageSent', (mensagem: Mensagem) => {
      // Mensagem enviada com sucesso
      console.log('SignalR: MessageSent recebida', mensagem);
      const currentMessages = this.messages();
      if (!currentMessages.find(m => m.id === mensagem.id)) {
        this.messages.set([mensagem, ...currentMessages]);
        // Notifica callbacks
        this.messageCallbacks.forEach(callback => {
          try {
            callback(mensagem);
          } catch (error) {
            console.error('Erro ao executar callback de mensagem:', error);
          }
        });
      }
    });

    this.hubConnection.on('MessageRead', (mensagemId: number) => {
      // Mensagem foi lida pelo admin
      const currentMessages = this.messages();
      const updated = currentMessages.map(m =>
        m.id === mensagemId ? { ...m, lida: true } : m
      );
      this.messages.set(updated);
    });

    this.hubConnection.on('Error', (error: string) => {
      console.error('Erro no SignalR:', error);
      // Notifica callbacks sobre o erro
      this.messageCallbacks.forEach(callback => {
        try {
          // Cria uma mensagem de erro fake para notificar os componentes
          callback({ id: -1, conteudo: `Erro: ${error}`, remetente_Tipo: 0 as any, usuario_Id: 0, lida: false, created_At: new Date().toISOString() } as any);
        } catch (err) {
          console.error('Erro ao notificar callback sobre erro:', err);
        }
      });
    });

    try {
      await this.hubConnection.start();
      this.connectionState.set(signalR.HubConnectionState.Connected);
      console.log('SignalR conectado com sucesso. Estado:', this.hubConnection.state);
    } catch (error: any) {
      console.error('Erro ao conectar SignalR:', error);
      this.connectionState.set(signalR.HubConnectionState.Disconnected);

      // Se for erro de WebSocket, tenta com transporte alternativo
      if (error.message?.includes('WebSocket') || error.message?.includes('Failed to start')) {
        console.warn('Tentando reconectar com transporte alternativo...');
        // Não relança o erro imediatamente, permite que o componente tente novamente
      }

      throw error;
    }
  }

  /**
   * Envia uma mensagem
   * @param conteudo Conteúdo da mensagem
   * @param usuarioIdDestino ID do usuário destinatário (apenas para admin, opcional)
   */
  async sendMessage(conteudo: string, usuarioIdDestino?: number): Promise<void> {
    if (this.hubConnection?.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Conexão SignalR não está ativa');
    }

    if (usuarioIdDestino !== undefined) {
      await this.hubConnection.invoke('SendMessage', conteudo, usuarioIdDestino);
    } else {
      await this.hubConnection.invoke('SendMessage', conteudo);
    }
  }

  /**
   * Marca mensagem como lida (apenas admin)
   */
  async markAsRead(mensagemId: number): Promise<void> {
    if (this.hubConnection?.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Conexão SignalR não está ativa');
    }

    await this.hubConnection.invoke('MarkAsRead', mensagemId);
  }

  /**
   * Para a conexão
   */
  async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.connectionState.set(signalR.HubConnectionState.Disconnected);
    }
  }

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }

  /**
   * Registra callback para novas mensagens
   */
  onNewMessage(callback: (mensagem: Mensagem) => void): () => void {
    this.messageCallbacks.push(callback);
    // Retorna função para remover callback
    return () => {
      const index = this.messageCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageCallbacks.splice(index, 1);
      }
    };
  }
}

