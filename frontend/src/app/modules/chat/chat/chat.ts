import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatWindow } from '../chat-window/chat-window';
import { ConversasList } from '../conversas-list/conversas-list';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ChatWindow, ConversasList],
  template: `
    <div class="chat-page">
      <div class="chat-container">
        @if (isAdmin) {
        <!-- Layout WhatsApp: Lista de conversas + Chat -->
        <div class="chat-layout">
          <div class="conversas-sidebar">
            <app-conversas-list
              [selectedUsuarioId]="selectedUsuarioId()"
              (conversaSelected)="onConversaSelected($event)">
            </app-conversas-list>
          </div>
          <div class="chat-main">
            <app-chat-window
              [usuarioId]="selectedUsuarioId()"
              [assunto]="assunto()">
            </app-chat-window>
          </div>
        </div>
        } @else {
        <!-- Layout normal para usuários -->
        <app-chat-window></app-chat-window>
        }
      </div>
    </div>
  `,
  styles: [`
    .chat-page {
      min-height: calc(100vh - 80px);
      padding: 0;
      background: var(--bg-secondary, #f8f9fa);
    }

    .chat-container {
      height: calc(100vh - 80px);
      max-width: 100%;
      margin: 0;
    }

    .chat-layout {
      display: flex;
      height: 100%;
      max-width: 1400px;
      margin: 0 auto;
      background: #fff;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    .conversas-sidebar {
      width: 350px;
      min-width: 300px;
      flex-shrink: 0;
      height: 100%;
      overflow: hidden;
    }

    .chat-main {
      flex: 1;
      height: 100%;
      min-width: 0;
    }

    @media (max-width: 768px) {
      .chat-page {
        padding: 0;
      }

      .chat-container {
        height: calc(100vh - 80px);
      }

      .conversas-sidebar {
        width: 100%;
        display: none;
      }

      .chat-layout.show-chat .conversas-sidebar {
        display: none;
      }

      .chat-layout.show-chat .chat-main {
        display: block;
      }
    }
  `]
})
export class Chat {
  selectedUsuarioId = signal<number | undefined>(undefined);
  assunto = signal<string | undefined>(undefined);

  constructor(private authService: AuthService) {}

  get isAdmin() {
    return this.authService.isAdmin();
  }

  onConversaSelected(usuarioId: number) {
    this.selectedUsuarioId.set(usuarioId);
    // O assunto será extraído pelo chat-window
  }
}

