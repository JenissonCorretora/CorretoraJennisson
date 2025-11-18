import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPassword {
  // Dados do formulário
  email = '';

  // Estados
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  emailSent = signal(false);

  constructor(private router: Router) {}

  /**
   * Envia link de recuperação de senha
   */
  onSubmit(): void {
    // Limpa mensagens anteriores
    this.errorMessage.set('');
    this.successMessage.set('');

    // Validações básicas
    if (!this.email) {
      this.errorMessage.set('Por favor, insira seu e-mail.');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage.set('Por favor, insira um e-mail válido.');
      return;
    }

    // Simula loading
    this.loading.set(true);

    // TODO: Implementar chamada para API
    setTimeout(() => {
      this.loading.set(false);
      console.log('Recuperação de senha solicitada para:', this.email);

      // Simula sucesso
      this.emailSent.set(true);
      this.successMessage.set(
        'Link de recuperação enviado! Verifique sua caixa de entrada e spam.'
      );
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
   * Volta para o login
   */
  backToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Tenta novamente (limpa o formulário)
   */
  tryAgain(): void {
    this.email = '';
    this.emailSent.set(false);
    this.successMessage.set('');
    this.errorMessage.set('');
  }
}

