import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIf],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class Navbar implements OnInit, OnDestroy {
  // Estado do menu mobile
  protected menuOpen = signal(false);

  // Estado de autenticação (conectado com AuthService via computed)
  isAdmin = computed(() => this.authService.isAdmin());
  isLoggedIn = computed(() => this.authService.isAuthenticated());
  currentUser = computed(() => this.authService.getCurrentUser());

  private authSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    // Escuta mudanças no estado de autenticação
    this.authSubscription = this.authService.isAuthenticated$.subscribe(() => {
      // Os signals já são reativos, mas podemos forçar atualização se necessário
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  /**
   * Alterna o estado do menu mobile
   */
  toggleMenu(): void {
    this.menuOpen.update(value => !value);
  }

  /**
   * Fecha o menu mobile ao clicar em um link
   */
  closeMenu(): void {
    this.menuOpen.set(false);
  }

  /**
   * Ação de login - Navega para página de login
   */
  onLogin(): void {
    this.closeMenu();
    this.router.navigate(['/login']);
  }

  /**
   * Ação de logout com confirmação
   */
  onLogout(): void {
    this.closeMenu();

    // Mostra popup de confirmação
    this.alertService.confirm(
      'Sair do Sistema',
      'Tem certeza que deseja sair do sistema?',
      'Sim, sair',
      'Cancelar',
      'question'
    ).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
      }
    });
  }

  /**
   * Obtém o email do usuário logado
   */
  getUserEmail(): string {
    const user = this.currentUser();
    return user?.email || '';
  }
}
