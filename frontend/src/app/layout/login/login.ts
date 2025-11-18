import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  // Dados do formulário
  email = '';
  password = '';
  rememberMe = false;

  // Estados
  loading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');

  constructor(private router: Router) {}

  /**
   * Realiza o login
   */
  onSubmit(): void {
    // Limpa mensagem de erro anterior
    this.errorMessage.set('');

    // Validações básicas
    if (!this.email || !this.password) {
      this.errorMessage.set('Por favor, preencha todos os campos.');
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
      console.log('Login:', { email: this.email, rememberMe: this.rememberMe });
      // Redirecionar após login bem-sucedido
      // this.router.navigate(['/admin/dashboard']);
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
   * Toggle visibilidade da senha
   */
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }
}

