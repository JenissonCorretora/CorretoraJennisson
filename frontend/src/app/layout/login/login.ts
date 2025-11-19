import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
  loginType = signal<'auto' | 'admin' | 'usuario'>('auto'); // auto tenta admin primeiro

  // Estados
  loading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    // Verifica se já está logado
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getCurrentUser();
      if (user?.role === 'Admin') {
        this.router.navigate(['/admin/imoveis']);
      } else {
        this.router.navigate(['/imoveis']);
      }
    }
  }

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

    this.loading.set(true);

    const loginType = this.loginType();

    // Se for modo específico (admin ou usuario), usa o método direto
    if (loginType === 'admin') {
      this.loginAsAdmin();
    } else if (loginType === 'usuario') {
      this.loginAsUsuario();
    } else {
      // Auto: identifica o tipo de usuário automaticamente
      this.loginAuto();
    }
  }

  /**
   * Login automático - identifica o tipo de usuário e faz login no endpoint correto
   */
  private loginAuto(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        // Login bem-sucedido - o AuthService já redireciona
        this.loading.set(false);
        const user = this.authService.getCurrentUser();
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] ||
                         (user?.role === 'Admin' ? '/admin/imoveis' : '/imoveis');
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        this.handleLoginError(error);
      }
    });
  }

  /**
   * Tenta login como administrador
   */
  private loginAsAdmin(): void {
    this.authService.loginAdmin(this.email, this.password).subscribe({
      next: () => {
        // Login bem-sucedido - o AuthService já redireciona
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/imoveis';
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        this.handleLoginError(error);
      }
    });
  }

  /**
   * Tenta login como usuário
   */
  private loginAsUsuario(): void {
    this.authService.loginUsuario(this.email, this.password).subscribe({
      next: () => {
        // Login bem-sucedido - o AuthService já redireciona
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/imoveis';
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        this.handleLoginError(error);
      }
    });
  }

  /**
   * Trata erros de login
   */
  private handleLoginError(error: any): void {
    this.loading.set(false);

    // Limpa qualquer token antigo que possa estar interferindo
    // Isso garante que não há tokens inválidos causando problemas
    if (error.status === 401) {
      // Se for 401, pode ser que haja um token antigo inválido
      // Limpa tokens para garantir estado limpo
      this.authService.logout();
      this.errorMessage.set('E-mail ou senha inválidos. Verifique suas credenciais.');
    } else if (error.status === 0) {
      this.errorMessage.set('Erro de conexão. Verifique se o servidor está rodando.');
    } else {
      this.errorMessage.set('Erro ao fazer login. Tente novamente mais tarde.');
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
   * Toggle visibilidade da senha
   */
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }
}

