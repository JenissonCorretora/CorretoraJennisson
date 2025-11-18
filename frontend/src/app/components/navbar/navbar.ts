import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class Navbar {
  // Estado do menu mobile
  protected menuOpen = signal(false);

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
   * Ação de login
   */
  onLogin(): void {
    // TODO: Implementar navegação para página de login
    console.log('Navegando para login...');
    this.closeMenu();
  }
}
