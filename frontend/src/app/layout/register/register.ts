import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {
  // Dados do formulário
  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  acceptTerms = false;

  // Estados
  loading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(private router: Router) {}

  /**
   * Realiza o cadastro
   */
  onSubmit(): void {
    // Limpa mensagens anteriores
    this.errorMessage.set('');
    this.successMessage.set('');

    // Validações básicas
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage.set('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage.set('Por favor, insira um e-mail válido.');
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage.set('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('As senhas não coincidem.');
      return;
    }

    if (!this.acceptTerms) {
      this.errorMessage.set('Você precisa aceitar os termos de uso.');
      return;
    }

    if (this.phone && !this.isValidPhone(this.phone)) {
      this.errorMessage.set('Por favor, insira um telefone válido.');
      return;
    }

    // Simula loading
    this.loading.set(true);

    // TODO: Implementar chamada para API
    setTimeout(() => {
      this.loading.set(false);
      console.log('Cadastro:', {
        name: this.name,
        email: this.email,
        phone: this.phone,
        acceptTerms: this.acceptTerms
      });

      // Simula sucesso
      this.successMessage.set('Conta criada com sucesso! Redirecionando...');

      // Redireciona após 2 segundos
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
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
    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    // Valida se tem 10 ou 11 dígitos (com ou sem DDD)
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }

  /**
   * Toggle visibilidade da senha
   */
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  /**
   * Toggle visibilidade da confirmação de senha
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  /**
   * Formata telefone enquanto digita
   */
  formatPhone(): void {
    let value = this.phone.replace(/\D/g, '');

    if (value.length <= 11) {
      if (value.length <= 10) {
        // (XX) XXXX-XXXX
        value = value.replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3');
      } else {
        // (XX) XXXXX-XXXX
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
      }
      this.phone = value;
    }
  }
}

