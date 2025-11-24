import { Component, Input, Output, EventEmitter, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService, Mensagem, Conversa, RemetenteTipo } from '../../../services/chat.service';
import { UsuarioService } from '../../../services/usuario.service';
import { SignalRService } from '../../../services/signalr.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-conversas-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conversas-list.html',
  styleUrls: ['./conversas-list.scss']
})
export class ConversasList implements OnInit, OnDestroy {
  @Input() selectedUsuarioId?: number;
  @Output() conversaSelected = new EventEmitter<number>();

  conversas = signal<Conversa[]>([]);
  loading = signal(false);
  private subscriptions = new Subscription();
  private unsubscribeMessage?: () => void;
  private isAdminUser = false;
  private currentUserId?: number;

  constructor(
    private chatService: ChatService,
    private usuarioService: UsuarioService,
    private signalRService: SignalRService,
    private authService: AuthService
  ) {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.isAdminUser = currentUser.role === 'Admin';
      this.currentUserId = currentUser.userId;
    }
  }

  async ngOnInit() {
    await this.loadConversas();

    // Inicia conexão SignalR se não estiver conectado (para receber mensagens em tempo real)
    try {
      if (!this.signalRService.isConnected()) {
        console.log('Iniciando conexão SignalR para lista de conversas...');
        await this.signalRService.startConnection();
        console.log('SignalR conectado para lista de conversas');
      } else {
        console.log('SignalR já estava conectado');
      }

      // Escuta novas mensagens do SignalR para atualizar a lista
      this.unsubscribeMessage = this.signalRService.onNewMessage((mensagem) => {
        // Se for mensagem de usuário, atualiza a lista de conversas
        if (mensagem.remetente_Tipo === RemetenteTipo.Usuario) {
          console.log('Nova mensagem de usuário recebida via SignalR, atualizando lista de conversas...', mensagem);
          // Atualiza imediatamente a lista
          this.loadConversas();
        }
      });

      console.log('Lista de conversas inicializada e escutando SignalR');
    } catch (error) {
      console.warn('Erro ao conectar SignalR na lista de conversas:', error);
      // Mesmo se SignalR falhar, continua funcionando com atualização periódica
    }

    // Atualiza a cada 30 segundos (fallback caso SignalR não funcione)
    setInterval(() => {
      console.log('Atualizando lista de conversas periodicamente...');
      this.loadConversas();
    }, 30000);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    if (this.unsubscribeMessage) {
      this.unsubscribeMessage();
    }
  }

  private async loadConversas() {
    try {
      this.loading.set(true);
      const allMessages = await firstValueFrom(this.chatService.getAll());
      if (!allMessages) {
        this.conversas.set([]);
        return;
      }

      // Agrupa mensagens por usuário primeiro
      const conversasMap = new Map<number, Conversa>();
      const usuariosParaBuscar = new Set<number>();

      // Primeiro passo: agrupa TODAS as mensagens por usuário (incluindo respostas de admin)
      for (const mensagem of allMessages) {
        // Cria entrada para o usuário se não existir
        if (!conversasMap.has(mensagem.usuario_Id)) {
          usuariosParaBuscar.add(mensagem.usuario_Id);
          conversasMap.set(mensagem.usuario_Id, {
            usuarioId: mensagem.usuario_Id,
            usuarioEmail: mensagem.usuario_Email || '',
            usuarioTelefone: undefined,
            usuarioNome: mensagem.usuario_Email?.split('@')[0] || 'Usuário',
            naoLidas: 0,
            mensagens: []
          });
        }

        const conversa = conversasMap.get(mensagem.usuario_Id)!;
        conversa.mensagens.push(mensagem);

        // Atualiza última mensagem (mais recente) - pode ser de usuário ou admin
        if (!conversa.ultimaMensagem ||
            new Date(mensagem.created_At) > new Date(conversa.ultimaMensagem.created_At)) {
          conversa.ultimaMensagem = mensagem;
          // Extrai assunto apenas da primeira mensagem do usuário
          if (mensagem.remetente_Tipo === RemetenteTipo.Usuario) {
            conversa.assunto = this.extractAssunto(mensagem.conteudo);
          }
        }

        // Conta não lidas apenas mensagens de usuários
        if (mensagem.remetente_Tipo === RemetenteTipo.Usuario && !mensagem.lida) {
          conversa.naoLidas++;
        }
      }

      // Segundo passo: busca dados dos usuários em paralelo
      const usuariosPromises = Array.from(usuariosParaBuscar).map(async (usuarioId) => {
        try {
          const usuario = await firstValueFrom(this.usuarioService.getById(usuarioId));
          const conversa = conversasMap.get(usuarioId);
          if (conversa && usuario) {
            const nomeExtraido = conversa.ultimaMensagem
              ? this.extractNameFromMessage(conversa.ultimaMensagem.conteudo)
              : undefined;

            conversa.usuarioNome = this.capitalizeFirst(
              nomeExtraido || usuario.email?.split('@')[0] || 'Usuário'
            );
            conversa.usuarioTelefone = usuario.telefone;
          }
        } catch (error) {
          console.warn(`Erro ao buscar dados do usuário ${usuarioId}:`, error);
        }
      });

      await Promise.all(usuariosPromises);

      // Converte para array e ordena por última mensagem (mais recente primeiro)
      const conversasArray = Array.from(conversasMap.values()).sort((a, b) => {
        if (!a.ultimaMensagem) return 1;
        if (!b.ultimaMensagem) return -1;
        return new Date(b.ultimaMensagem.created_At).getTime() -
               new Date(a.ultimaMensagem.created_At).getTime();
      });

      const conversasFiltradas =
        !this.isAdminUser && this.currentUserId
          ? conversasArray.filter(conversa => conversa.usuarioId === this.currentUserId)
          : conversasArray;

      this.conversas.set(conversasFiltradas);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      this.conversas.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  selectConversa(usuarioId: number) {
    if (!this.isAdminUser) {
      if (this.currentUserId && usuarioId !== this.currentUserId) {
        console.warn('Usuário tentou acessar conversa de outro cliente. Ação bloqueada.');
        return;
      }
      this.conversaSelected.emit(usuarioId);
      return;
    }

    // Atualiza imediatamente qual conversa está selecionada
    this.conversaSelected.emit(usuarioId);

    // Marca como lidas em background para não atrasar a seleção
    this.markConversasComoLidas(usuarioId).catch(error =>
      console.error('Erro ao marcar mensagens como lidas:', error)
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days}d`;

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  }

  getPreviewText(conteudo: string): string {
    // Remove metadados e retorna apenas o conteúdo principal
    const lines = conteudo.split('\n');
    let preview = '';

    for (const line of lines) {
      if (line.startsWith('Assunto:') || line.startsWith('Contato:') ||
          line.startsWith('E-mail:') || line.startsWith('Telefone:') ||
          line.startsWith('---')) {
        continue;
      }
      if (line.trim()) {
        preview = line.trim();
        break;
      }
    }

    return preview || 'Sem mensagem';
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

  private async markConversasComoLidas(usuarioId: number) {
    if (!this.isAdminUser) {
      return;
    }

    const conversas = [...this.conversas()];
    const conversa = conversas.find(c => c.usuarioId === usuarioId);
    if (!conversa) return;

    const mensagensNaoLidas = conversa.mensagens.filter(
      mensagem => mensagem.remetente_Tipo === RemetenteTipo.Usuario && !mensagem.lida
    );

    if (mensagensNaoLidas.length === 0) {
      return;
    }

    try {
      await Promise.all(
        mensagensNaoLidas.map(mensagem =>
          firstValueFrom(this.chatService.markAsRead(mensagem.id))
        )
      );

      // Atualiza estado local
      conversa.mensagens = conversa.mensagens.map(mensagem =>
        mensagem.remetente_Tipo === RemetenteTipo.Usuario
          ? { ...mensagem, lida: true }
          : mensagem
      );
      conversa.naoLidas = 0;
      this.conversas.set(conversas);
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  }
}

