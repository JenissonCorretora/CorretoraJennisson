import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contato.html',
  styleUrl: './contato.scss'
})
export class Contato {
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
  // TODO: Conectar com serviço de autenticação
  // Para testar estado logado, mude para: isLoggedIn = signal(true);
  isLoggedIn = signal(true); // ← TEMPORÁRIO: Testando estado logado

  // Dados do usuário logado (simulado)
  loggedUser = {
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 98765-4321'
  };

  // Informações de contato do corretor
  corretor = {
    name: 'Jenisson Luckwü',
    creci: 'CRECI 11639',
    phone: '(00) 00000-0000',
    email: 'contato@jenissonluckwu.com.br',
    whatsapp: '5500000000000',
    address: 'Endereço da Corretora',
    horario: 'Segunda a Sexta: 9h às 18h'
  };

  /**
   * Envia o formulário de contato
   */
  onSubmit(): void {
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

    // Simula loading
    this.loading.set(true);

    // TODO: Implementar chamada para API
    setTimeout(() => {
      this.loading.set(false);

      const contactData = this.isLoggedIn()
        ? {
          name: this.loggedUser.name,
          email: this.loggedUser.email,
          phone: this.loggedUser.phone,
          subject: this.subject,
          message: this.message
        }
        : {
          name: this.name,
          email: this.email,
          phone: this.phone,
          subject: this.subject,
          message: this.message
        };

      console.log('Contato:', contactData);

      // Simula sucesso
      this.successMessage.set('Mensagem enviada com sucesso! Entraremos em contato em breve.');

      // Limpa apenas os campos editáveis
      this.subject = '';
      this.message = '';
      if (!this.isLoggedIn()) {
        this.name = '';
        this.email = '';
        this.phone = '';
      }
    }, 2000);
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
