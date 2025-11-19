import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdministradorService } from '../../services/administrador.service';

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

  // Estados
  loading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(
    private router: Router,
    private administradorService: AdministradorService
  ) {}

  /**
   * Realiza o cadastro do administrador
   */
  onSubmit(): void {
    // Limpa mensagens anteriores
    this.errorMessage.set('');
    this.successMessage.set('');

    // Validações básicas
    if (!this.name || !this.email || !this.creci || !this.password || !this.confirmPassword) {
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

    // Inicia o processo de cadastro
    this.loading.set(true);

    // Verifica se o email já existe
    this.administradorService.emailExists(this.email).then((exists) => {
      if (exists) {
        this.loading.set(false);
        this.errorMessage.set('Este e-mail já está cadastrado como administrador.');
        return;
      }

      // Prepara os dados para envio
      const telefoneLimpo = this.phone ? this.phone.replace(/\D/g, '') : undefined;
      const creciLimpo = this.creci.replace(/\D/g, '');

      const administradorData = {
        nome: this.name.trim(),
        email: this.email.trim().toLowerCase(),
        senha: this.password,
        telefone: telefoneLimpo,
        id_PFPJ: creciLimpo || undefined
        // stream_user_id não é enviado - será implementado no futuro para chatbot
      };

      // Chama a API para criar o administrador
      this.administradorService.create(administradorData).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.successMessage.set('Conta de administrador criada com sucesso! Você já pode fazer login.');

          // Limpa os campos
          this.name = '';
          this.email = '';
          this.phone = '';
          this.creci = '';
          this.password = '';
          this.confirmPassword = '';

          // Redireciona para login após 1 segundo (tempo suficiente para ver a mensagem)
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1000);
        },
        error: (error) => {
          this.loading.set(false);
          console.error('Erro ao criar administrador:', error);

          if (error.status === 400) {
            // Erro de validação do backend
            const errorMessage = error.error?.message || error.error || 'Dados inválidos. Verifique os campos e tente novamente.';
            this.errorMessage.set(errorMessage);
          } else if (error.status === 409 || error.status === 422) {
            // Conflito - email já existe ou dados duplicados
            this.errorMessage.set('Este e-mail já está cadastrado ou há dados duplicados.');
          } else if (error.status === 0) {
            // Erro de conexão
            this.errorMessage.set('Erro de conexão. Verifique se o servidor está rodando.');
          } else {
            // Outros erros
            this.errorMessage.set('Erro ao criar conta de administrador. Tente novamente mais tarde.');
          }
        }
      });
    }).catch((error) => {
      this.loading.set(false);
      console.error('Erro ao verificar email:', error);
      // Continua com o cadastro mesmo se a verificação falhar
      // O backend fará a validação final
    });
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

