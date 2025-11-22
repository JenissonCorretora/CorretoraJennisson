import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService, CreateUsuarioRequest } from '../../services/usuario.service';

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

  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  /**
   * Realiza o cadastro
   */
  async onSubmit(): Promise<void> {
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

    // Valida se o nome foi preenchido
    if (!this.name || !this.name.trim()) {
      this.errorMessage.set('Por favor, preencha o nome completo.');
      return;
    }

    // Prepara dados para envio (incluindo nome agora que é obrigatório)
    // O backend vai validar se o email já existe
    this.loading.set(true);
    const usuarioData: CreateUsuarioRequest = {
      nome: this.name.trim(),
      email: this.email.trim(),
      senha: this.password,
      telefone: this.phone.trim() || undefined
      // stream_user_id comentado conforme solicitado
    };

    // Chama a API para criar o usuário
    this.usuarioService.create(usuarioData).subscribe({
      next: (usuario) => {
        this.loading.set(false);
        this.successMessage.set('Conta criada com sucesso! Redirecionando para login...');

        // Limpa o formulário
        this.name = '';
        this.email = '';
        this.phone = '';
        this.password = '';
        this.confirmPassword = '';
        this.acceptTerms = false;

        // Redireciona para login após 1 segundo (tempo suficiente para ver a mensagem)
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { registered: 'true' }
          });
        }, 1000);
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Erro ao criar usuário:', error);

        // Tratamento de erros específicos
        if (error.status === 400) {
          this.errorMessage.set('Dados inválidos. Verifique os campos e tente novamente.');
        } else if (error.status === 409 || error.status === 422) {
          this.errorMessage.set('Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.');
        } else if (error.status === 0 || error.status >= 500) {
          this.errorMessage.set('Erro no servidor. Tente novamente mais tarde.');
        } else if (error.status === 404) {
          this.errorMessage.set('Serviço não encontrado. Verifique sua conexão.');
        } else {
          this.errorMessage.set('Erro ao criar conta. Tente novamente.');
        }
      }
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

