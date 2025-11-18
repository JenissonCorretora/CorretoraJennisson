import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-register.html',
  styleUrl: './admin-register.scss'
})
export class AdminRegister {
  // Dados do formulário
  name = '';
  email = '';
  phone = '';
  creci = '';
  password = '';
  confirmPassword = '';
  secretCode = ''; // Código secreto para validar que é admin

  // Estados
  loading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(private router: Router) {}

  /**
   * Realiza o cadastro do administrador
   */
  onSubmit(): void {
    // Limpa mensagens anteriores
    this.errorMessage.set('');
    this.successMessage.set('');

    // Validações básicas
    if (!this.name || !this.email || !this.creci || !this.password || !this.confirmPassword || !this.secretCode) {
      this.errorMessage.set('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage.set('Por favor, insira um e-mail válido.');
      return;
    }

    if (!this.isValidCreci(this.creci)) {
      this.errorMessage.set('Por favor, insira um CRECI válido (apenas números).');
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage.set('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('As senhas não coincidem.');
      return;
    }

    if (this.phone && !this.isValidPhone(this.phone)) {
      this.errorMessage.set('Por favor, insira um telefone válido.');
      return;
    }

    // TODO: Validar código secreto com o backend
    if (this.secretCode.length < 6) {
      this.errorMessage.set('Código secreto inválido.');
      return;
    }

    // Simula loading
    this.loading.set(true);

    // TODO: Implementar chamada para API
    setTimeout(() => {
      this.loading.set(false);
      console.log('Cadastro Admin:', {
        name: this.name,
        email: this.email,
        phone: this.phone,
        creci: this.creci,
        secretCode: this.secretCode
      });
      
      // Simula sucesso
      this.successMessage.set('Conta de administrador criada com sucesso! Redirecionando...');
      
      // Redireciona após 2 segundos
      setTimeout(() => {
        this.router.navigate(['/admin/login']);
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
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }

  /**
   * Valida CRECI (apenas números)
   */
  private isValidCreci(creci: string): boolean {
    const cleanCreci = creci.replace(/\D/g, '');
    return cleanCreci.length >= 4 && cleanCreci.length <= 10;
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
        value = value.replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3');
      } else {
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
      }
      this.phone = value;
    }
  }

  /**
   * Formata CRECI enquanto digita
   */
  formatCreci(): void {
    // Remove tudo que não é número
    this.creci = this.creci.replace(/\D/g, '');
    
    // Limita a 10 dígitos
    if (this.creci.length > 10) {
      this.creci = this.creci.substring(0, 10);
    }
  }
}

