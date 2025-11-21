import { Component, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsuarioService, Usuario } from '../../services/usuario.service';
import { ChatService } from '../../services/chat.service';
import { SignalRService } from '../../services/signalr.service';
import { AlertService } from '../../services/alert.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contato.html',
  styleUrl: './contato.scss'
})
export class Contato implements OnInit {
  // Dados do formulário
  name = '';
  email = '';
  phone = '';
  subject = '';
  message = '';

  // Estados
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  isLoggedIn = signal(false);

  // Dados do usuário logado
  loggedUser = signal<{
    name: string;
    email: string;
    phone: string;
  } | null>(null);

  // Informações de contato do corretor
  corretor = {
    name: 'Jenisson Luckwü',
    creci: 'CRECI 11639',
    phone: '(83) 99919-9475',
    email: 'jenissonluckwu_imoveis@gmail.com',
    whatsapp: '5583999199475',
    address: 'João Pessoa - PB',
    horario: 'Segunda a Sexta: 9h às 18h'
  };

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private chatService: ChatService,
    private signalRService: SignalRService,
    private alertService: AlertService
  ) {
    // Observa mudanças no estado de autenticação
    effect(() => {
      const isAuth = this.authService.isAuthenticated();
      this.isLoggedIn.set(isAuth);

      if (isAuth) {
        this.loadUserData();
      } else {
        this.loggedUser.set(null);
      }
    });
  }

  async ngOnInit() {
    // Verifica se está logado ao inicializar
    const isAuth = this.authService.isAuthenticated();
    this.isLoggedIn.set(isAuth);

    if (isAuth) {
      await this.loadUserData();
    }
  }

  /**
   * Carrega dados do usuário logado
   */
  private async loadUserData() {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) return;

      // Busca dados completos do usuário
            const usuario = await firstValueFrom(this.usuarioService.getById(currentUser.userId));
      if (usuario) {
        // Extrai nome do email (parte antes do @) ou usa email
        const nameFromEmail = usuario.email?.split('@')[0] || 'Usuário';
        const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

        this.loggedUser.set({
          name: formattedName,
          email: usuario.email || '',
          phone: usuario.telefone || ''
        });

        // Preenche automaticamente os campos
        this.email = usuario.email || '';
        this.phone = usuario.telefone || '';
        this.name = formattedName;
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  }

  /**
   * Envia o formulário de contato através do sistema de chat
   */
  async onSubmit(): Promise<void> {
    // Limpa mensagens anteriores
    this.errorMessage.set('');
    this.successMessage.set('');

    // Validações diferentes para usuário logado e não logado
    if (this.isLoggedIn()) {
      // Usuário logado: valida apenas assunto e mensagem
      if (!this.subject || !this.message) {
        this.errorMessage.set('Por favor, preencha o assunto e a mensagem.');
        return;
      }
    } else {
      // Usuário não logado: valida todos os campos
      if (!this.name || !this.email || !this.subject || !this.message) {
        this.errorMessage.set('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      if (!this.isValidEmail(this.email)) {
        this.errorMessage.set('Por favor, insira um e-mail válido.');
        return;
      }

      if (this.phone && !this.isValidPhone(this.phone)) {
        this.errorMessage.set('Por favor, insira um telefone válido.');
        return;
      }
    }

    this.loading.set(true);

    try {
      // Formata a mensagem incluindo dados do contato e assunto
      const userData = this.isLoggedIn() && this.loggedUser()
        ? {
            name: this.loggedUser()!.name,
            email: this.loggedUser()!.email,
            phone: this.loggedUser()!.phone
          }
        : {
            name: this.name,
            email: this.email,
            phone: this.phone
          };

      // Monta mensagem formatada
      let formattedMessage = `Assunto: ${this.subject}\n\n`;
      formattedMessage += `${this.message}\n\n`;
      formattedMessage += `---\n`;
      formattedMessage += `Contato: ${userData.name}\n`;
      formattedMessage += `E-mail: ${userData.email}\n`;
      if (userData.phone) {
        formattedMessage += `Telefone: ${userData.phone}\n`;
      }

      // Verifica se o usuário está logado
      if (!this.isLoggedIn()) {
        // Usuário não logado: orienta a fazer login
        this.errorMessage.set('Para enviar mensagens através do chat, é necessário estar logado. Por favor, faça login ou crie uma conta. Você também pode entrar em contato via WhatsApp, telefone ou e-mail usando os botões acima.');
        this.loading.set(false);
        return;
      }

      // Usuário logado: envia via SignalR (chat)
      let messageSent = false;

      try {
        // Inicia conexão SignalR se não estiver conectado
        if (!this.signalRService.isConnected()) {
          try {
            await this.signalRService.startConnection();
          } catch (connError: any) {
            console.warn('Erro ao conectar SignalR, tentando via REST:', connError);
            // Se falhar a conexão, tenta via REST diretamente
            await firstValueFrom(this.chatService.create({ conteudo: formattedMessage }));
            messageSent = true;
          }
        }

        // Se ainda não enviou, tenta via SignalR
        if (!messageSent) {
          try {
            console.log('Enviando mensagem via SignalR...');
            await this.signalRService.sendMessage(formattedMessage);
            console.log('Mensagem enviada via SignalR com sucesso');
            messageSent = true;
          } catch (signalRError: any) {
            console.warn('Erro ao enviar via SignalR, tentando via REST:', signalRError);
            // Se falhar via SignalR, tenta via REST API
            try {
              const mensagemCriada = await firstValueFrom(this.chatService.create({ conteudo: formattedMessage }));
              console.log('Mensagem enviada via REST:', mensagemCriada);
              messageSent = true;
              // Nota: Mensagens via REST não notificam em tempo real via SignalR
              // A lista será atualizada no próximo refresh (30s) ou quando o admin recarregar
            } catch (restError: any) {
              console.error('Erro ao enviar via REST:', restError);
              throw restError;
            }
          }
        }
      } catch (error: any) {
        // Se ambos falharem, lança o erro
        throw error;
      }

      // Sucesso
      if (messageSent) {
        this.successMessage.set('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        this.alertService.success('Mensagem enviada!', 'Sua mensagem foi enviada com sucesso. Responderemos em breve.');
      }

      // Limpa apenas os campos editáveis
      this.subject = '';
      this.message = '';
      if (!this.isLoggedIn()) {
        this.name = '';
        this.email = '';
        this.phone = '';
      }
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      this.errorMessage.set('Erro ao enviar mensagem. Tente novamente mais tarde.');
      this.alertService.error('Erro ao enviar mensagem', 'Tente novamente mais tarde.');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Valida formato de e-mail
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida formato de telefone
   */
  private isValidPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }

  /**
   * Formata telefone enquanto digita
   */
  formatPhone(): void {
    let value = this.phone.replace(/\D/g, '');

    if (value.length <= 11) {
      if (value.length <= 10) {
        value = value.replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3');
      } else {
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
      }
      this.phone = value;
    }
  }

  /**
   * Abre WhatsApp
   */
  openWhatsApp(): void {
    const message = encodeURIComponent('Olá! Gostaria de mais informações sobre imóveis.');
    window.open(`https://wa.me/${this.corretor.whatsapp}?text=${message}`, '_blank');
  }

  /**
   * Faz ligação
   */
  makeCall(): void {
    window.location.href = `tel:${this.corretor.phone.replace(/\D/g, '')}`;
  }

  /**
   * Envia e-mail
   */
  sendEmail(): void {
    window.location.href = `mailto:${this.corretor.email}`;
  }
}
