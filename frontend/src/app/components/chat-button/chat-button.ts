import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-button.html',
  styleUrls: ['./chat-button.scss']
})
export class ChatButton {
  isOpen = signal(false);
  unreadCount = signal(0);

  constructor(
    private router: Router,
    private authService: AuthService,
    private chatService: ChatService
  ) {
    // Verifica se está logado
    if (this.authService.isAuthenticated()) {
      this.loadUnreadCount();
      // Atualiza contagem periodicamente
      setInterval(() => this.loadUnreadCount(), 30000); // A cada 30 segundos
    }
  }

  private async loadUnreadCount() {
    try {
      // Conta mensagens não lidas do usuário (respostas do admin)
      const messages = await this.chatService.getAll().toPromise();
      if (messages) {
        const unread = messages.filter(m =>
          !m.lida &&
          m.remetente_Tipo === 2 // Administrador
        ).length;
        this.unreadCount.set(unread);
      }
    } catch (error) {
      console.error('Erro ao carregar contagem de não lidas:', error);
    }
  }

  toggleChat() {
    this.isOpen.update(value => !value);
    if (this.isOpen()) {
      this.router.navigate(['/chat']);
    }
  }

  shouldShow(): boolean {
    // Mostra apenas para usuários logados (não admin)
    return this.authService.isAuthenticated() && !this.authService.isAdmin();
  }
}

