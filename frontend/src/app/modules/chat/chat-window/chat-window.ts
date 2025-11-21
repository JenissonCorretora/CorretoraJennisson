import { Component, OnInit, OnDestroy, signal, computed, ViewChild, ElementRef, AfterViewChecked, Input, effect, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Mensagem, RemetenteTipo } from '../../../services/chat.service';
import { SignalRService } from '../../../services/signalr.service';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-window.html',
  styleUrls: ['./chat-window.scss']
})
export class ChatWindow implements OnInit, OnDestroy, AfterViewChecked, OnChanges {
  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;

  @Input() usuarioId?: number;
  @Input() assunto?: string;

  messages = signal<Mensagem[]>([]);
  allMessages = signal<Mensagem[]>([]); // Todas as mensagens (para admin)
  newMessage = signal('');
  loading = signal(false);
  isConnected = signal(false);
  isAdmin = computed(() => this.authService.isAdmin());
  unreadCount = signal(0);
  currentAssunto = signal<string | undefined>(undefined);
  currentUsuarioNome = signal<string>('Cliente');
  currentUsuarioEmail = signal<string | undefined>(undefined);
  currentUsuarioTelefone = signal<string | undefined>(undefined);

  private shouldScroll = false;
  private unsubscribeMessage?: () => void;
  private usuarioIdSignal = signal<number | undefined>(undefined);

  constructor(
    private chatService: ChatService,
    private signalRService: SignalRService,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {
    // Observa mudanças no usuarioId selecionado
    effect(() => {
      const usuarioId = this.usuarioIdSignal();
      const allMsgs = this.allMessages();

      if (this.isAdmin()) {
        // Admin: só mostra mensagens se tiver um usuário selecionado
        if (usuarioId !== undefined && allMsgs.length > 0) {
          this.filterMessagesByUsuario();
          this.loadUsuarioInfo();
        } else {
          // Admin sem seleção: não mostra mensagens
          this.messages.set([]);
        }
      } else {
        // Usuário comum: mostra apenas suas mensagens
        if (allMsgs.length > 0) {
          this.messages.set(allMsgs);
        }
      }
    });
  }

  ngOnChanges() {
    // Atualiza o signal quando o @Input() muda
    if (this.usuarioId !== this.usuarioIdSignal()) {
      this.usuarioIdSignal.set(this.usuarioId);
    }
  }

  async ngOnInit() {
    await this.initializeChat();
  }

  ngOnDestroy() {
    // Remove callback de mensagens
    if (this.unsubscribeMessage) {
      this.unsubscribeMessage();
    }
    // Não desconecta o SignalR aqui, pois pode ser usado em outros lugares
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private async initializeChat() {
    try {
      this.loading.set(true);

      // Conecta SignalR
      await this.signalRService.startConnection();
      // Aguarda um pouco para garantir que a conexão está estabelecida
      await new Promise(resolve => setTimeout(resolve, 100));
      this.isConnected.set(this.signalRService.isConnected());

      // Carrega mensagens existentes
      await this.loadMessages();

      // Escuta novas mensagens do SignalR
      this.unsubscribeMessage = this.signalRService.onNewMessage((mensagem) => {
        console.log('ChatWindow: Nova mensagem recebida via SignalR', mensagem);
        const currentAllMessages = this.allMessages();
        // Verifica se a mensagem já existe
        if (!currentAllMessages.find(m => m.id === mensagem.id)) {
          const updated = [...currentAllMessages, mensagem].sort((a, b) =>
            new Date(a.created_At).getTime() - new Date(b.created_At).getTime()
          );
          this.allMessages.set(updated);

          // Se for admin e tiver usuarioId selecionado, filtra
          if (this.isAdmin()) {
            if (this.usuarioIdSignal() !== undefined) {
              // Se a mensagem é do usuário selecionado, mostra
              if (mensagem.usuario_Id === this.usuarioIdSignal()) {
                this.filterMessagesByUsuario();
                this.shouldScroll = true;
              }
              // Se não é do usuário selecionado, não mostra mas mantém em allMessages
            } else {
              // Admin sem seleção: não mostra mensagem individual, mas mantém em allMessages
              // A lista de conversas será atualizada pelo componente conversas-list
            }
          } else {
            // Usuário comum: adiciona mensagem
            this.messages.set(updated);
            this.shouldScroll = true;
          }
        }
      });

      // Se for admin, carrega contagem de não lidas
      if (this.isAdmin()) {
        this.loadUnreadCount();
        // Atualiza contagem periodicamente
        setInterval(() => {
          this.loadUnreadCount();
          // Também recarrega mensagens periodicamente para garantir sincronização
          this.loadMessages();
        }, 30000); // A cada 30 segundos
      }

      this.loading.set(false);
      console.log('Chat inicializado. Admin:', this.isAdmin(), 'Conectado:', this.isConnected());
    } catch (error) {
      console.error('Erro ao inicializar chat:', error);
      this.loading.set(false);
      // Tenta recarregar mensagens mesmo se SignalR falhar
      try {
        await this.loadMessages();
      } catch (loadError) {
        console.error('Erro ao carregar mensagens após falha do SignalR:', loadError);
      }
    }
  }

  private async loadMessages() {
    try {
      const allMessages = await firstValueFrom(this.chatService.getAll());
      if (allMessages && allMessages.length > 0) {
        // Ordena por data (mais antigas primeiro) para exibição cronológica
        const sorted = allMessages.sort((a, b) =>
          new Date(a.created_At).getTime() - new Date(b.created_At).getTime()
        );
        console.log('Mensagens carregadas:', sorted.length, sorted);
        this.allMessages.set(sorted);

        // O effect() vai cuidar de filtrar as mensagens corretamente
        // Mas vamos garantir que filtra se já tiver usuarioId
        if (this.isAdmin()) {
          if (this.usuarioIdSignal() !== undefined) {
            this.filterMessagesByUsuario();
          } else {
            // Admin sem seleção: não mostra mensagens
            this.messages.set([]);
          }
        } else {
          // Usuário comum: mostra todas as mensagens (já filtradas pelo backend)
          this.messages.set(sorted);
        }

        this.shouldScroll = true;
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  }

  private filterMessagesByUsuario() {
    const usuarioId = this.usuarioIdSignal();
    if (usuarioId === undefined) {
      this.messages.set([]);
      return;
    }

    // Filtra mensagens: apenas as que pertencem a este usuário
    // Isso inclui mensagens enviadas pelo usuário E mensagens enviadas pelo admin para este usuário
    const filtered = this.allMessages().filter(m => m.usuario_Id === usuarioId);
    console.log(`Filtrando mensagens para usuário ${usuarioId}:`, filtered.length, filtered);
    this.messages.set(filtered);

    // Extrai assunto da primeira mensagem do usuário
    const primeiraMensagem = filtered.find(m => m.remetente_Tipo === RemetenteTipo.Usuario);
    if (primeiraMensagem) {
      const assunto = this.extractAssunto(primeiraMensagem.conteudo);
      this.currentAssunto.set(assunto || this.assunto);
    } else {
      this.currentAssunto.set(this.assunto);
    }

    this.shouldScroll = true;
  }

  private async loadUsuarioInfo() {
    const usuarioId = this.usuarioIdSignal();
    if (usuarioId === undefined) return;

    try {
      const usuario = await firstValueFrom(this.usuarioService.getById(usuarioId));
      if (usuario) {
        // Define email
        this.currentUsuarioEmail.set(usuario.email);

        // Define telefone
        this.currentUsuarioTelefone.set(usuario.telefone);

        // Tenta extrair nome da primeira mensagem do usuário
        const primeiraMensagem = this.allMessages().find(
          m => m.usuario_Id === usuarioId && m.remetente_Tipo === RemetenteTipo.Usuario
        );
        if (primeiraMensagem) {
          const nomeExtraido = this.extractNameFromMessage(primeiraMensagem.conteudo);
          if (nomeExtraido) {
            this.currentUsuarioNome.set(nomeExtraido);
          } else {
            // Se não encontrar nome na mensagem, usa email
            const nome = usuario.email?.split('@')[0] || 'Usuário';
            this.currentUsuarioNome.set(this.capitalizeFirst(nome));
          }
        } else {
          // Se não tiver mensagem, usa email
          const nome = usuario.email?.split('@')[0] || 'Usuário';
          this.currentUsuarioNome.set(this.capitalizeFirst(nome));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  }

  private extractAssunto(conteudo: string): string | undefined {
    const assuntoMatch = conteudo.match(/Assunto:\s*(.+)/i);
    if (assuntoMatch) {
      return assuntoMatch[1].trim();
    }
    return undefined;
  }

  private extractNameFromMessage(conteudo: string): string | undefined {
    const contatoMatch = conteudo.match(/Contato:\s*(.+)/i);
    if (contatoMatch) {
      return contatoMatch[1].trim();
    }
    return undefined;
  }

  private capitalizeFirst(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  private async loadUnreadCount() {
    // Só tenta carregar se for admin
    if (!this.isAdmin()) {
      return;
    }

    try {
      const count = await firstValueFrom(this.chatService.getCountNaoLidas());
      if (count !== undefined) {
        this.unreadCount.set(count);
      }
    } catch (error: any) {
      // Ignora erro 403 (Forbidden) - pode ser que o token não tenha a role Admin ainda
      if (error?.status !== 403) {
        console.error('Erro ao carregar contagem de não lidas:', error);
      }
    }
  }

  async sendMessage() {
    const conteudo = this.newMessage().trim();
    if (!conteudo || !this.isConnected()) {
      return;
    }

    // Se for admin e tiver um usuarioId selecionado, envia para aquele usuário
    const usuarioIdDestino = this.isAdmin() && this.usuarioIdSignal() !== undefined
      ? this.usuarioIdSignal()
      : undefined;

    try {
      await this.signalRService.sendMessage(conteudo, usuarioIdDestino);
      this.newMessage.set('');
      this.shouldScroll = true;
      // Recarrega mensagens para atualizar a lista
      await this.loadMessages();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Tenta enviar via REST como fallback
      try {
        await firstValueFrom(this.chatService.create({ conteudo }));
        this.newMessage.set('');
        await this.loadMessages();
      } catch (restError) {
        console.error('Erro ao enviar mensagem via REST:', restError);
      }
    }
  }

  async markAsRead(mensagemId: number) {
    if (!this.isAdmin()) {
      return;
    }

    try {
      await this.signalRService.markAsRead(mensagemId);
      // Atualiza localmente
      const updated = this.messages().map(m =>
        m.id === mensagemId ? { ...m, lida: true } : m
      );
      this.messages.set(updated);
      this.loadUnreadCount();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  }

  isUsuarioMessage(mensagem: Mensagem): boolean {
    // Para admin: mensagem de usuário é quando o remetente é Usuario
    // Para usuário comum: mensagem de usuário é quando o usuario_Id é o mesmo do usuário logado
    if (this.isAdmin()) {
      return mensagem.remetente_Tipo === RemetenteTipo.Usuario;
    } else {
      const currentUser = this.authService.getCurrentUser();
      return mensagem.remetente_Tipo === RemetenteTipo.Usuario &&
             mensagem.usuario_Id === currentUser?.userId;
    }
  }

  getSenderName(mensagem: Mensagem): string {
    if (this.isAdmin()) {
      // Admin vê: nome do cliente quando é mensagem do cliente, "Você" quando é do admin
      if (mensagem.remetente_Tipo === RemetenteTipo.Usuario) {
        // Se está vendo conversa de um usuário específico, mostra o nome dele
        const usuarioId = this.usuarioIdSignal();
        if (usuarioId !== undefined && mensagem.usuario_Id === usuarioId) {
          return this.currentUsuarioNome();
        }
        // Caso contrário, tenta extrair do email ou mensagem
        return mensagem.usuario_Email?.split('@')[0] || 'Cliente';
      } else {
        return 'Você';
      }
    } else {
      // Usuário comum vê: "Você" quando é sua mensagem, "Administrador" quando é do admin
      if (mensagem.remetente_Tipo === RemetenteTipo.Usuario) {
        return 'Você';
      } else {
        return mensagem.administrador_Nome || 'Administrador';
      }
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min atrás`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h atrás`;

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCleanMessageText(conteudo: string): string {
    if (!conteudo || !conteudo.trim()) {
      return conteudo;
    }

    // Remove metadados e retorna apenas o conteúdo principal
    const lines = conteudo.split('\n');
    const cleanLines: string[] = [];
    let foundContent = false;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Pula linhas de metadados
      if (trimmedLine.startsWith('Assunto:') ||
          trimmedLine.startsWith('Contato:') ||
          trimmedLine.startsWith('E-mail:') ||
          trimmedLine.startsWith('Telefone:') ||
          trimmedLine === '---') {
        continue;
      }

      // Se a linha tem conteúdo (não é metadado), adiciona
      if (trimmedLine) {
        cleanLines.push(line);
        foundContent = true;
      }
    }

    // Se encontrou conteúdo limpo, retorna
    if (foundContent && cleanLines.length > 0) {
      return cleanLines.join('\n').trim();
    }

    // Se não encontrou conteúdo limpo, retorna o original (pode ser uma mensagem simples sem metadados)
    return conteudo.trim();
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}

