import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FavoritoService, Favorito } from '../../services/favorito.service';
import { ImovelService, Imovel } from '../../services/imovel.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.scss'
})
export class Favoritos implements OnInit {
  // Estados
  loading = signal(false);
  errorMessage = signal('');
  isLoggedIn = signal(false);
  currentUser = signal<any>(null);

  // Dados
  favoritos = signal<Favorito[]>([]);
  imoveis = signal<Imovel[]>([]);

  constructor(
    private favoritoService: FavoritoService,
    private imovelService: ImovelService,
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {
    // Inicializa signals de autenticação
    this.isLoggedIn = this.authService.isAuthenticated;
    this.currentUser = this.authService.currentUser;
  }

  ngOnInit(): void {
    // Verifica se está logado
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/favoritos' }
      });
      return;
    }

    this.carregarFavoritos();
  }

  /**
   * Carrega favoritos do usuário logado
   */
  carregarFavoritos(): void {
    const user = this.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.favoritoService.getByUsuarioId(user.userId).subscribe({
      next: (favoritos) => {
        this.favoritos.set(favoritos);

        // Carrega dados completos dos imóveis
        if (favoritos.length > 0) {
          this.carregarImoveis(favoritos.map(f => f.imovel_Id));
        } else {
          this.imoveis.set([]);
          this.loading.set(false);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar favoritos:', error);
        this.errorMessage.set('Erro ao carregar favoritos. Tente novamente mais tarde.');
        this.loading.set(false);
      }
    });
  }

  /**
   * Carrega dados completos dos imóveis favoritados
   */
  private carregarImoveis(imovelIds: number[]): void {
    const imoveisPromises = imovelIds.map(id =>
      this.imovelService.getById(id).toPromise()
    );

    Promise.all(imoveisPromises).then(imoveis => {
      // Filtra undefined (caso algum imóvel não exista mais) e imóveis desativados
      const imoveisValidos = (imoveis.filter(i => i !== undefined) as Imovel[])
        .filter(imovel => imovel.ativo !== false);
      this.imoveis.set(imoveisValidos);
      this.loading.set(false);
    }).catch(error => {
      console.error('Erro ao carregar imóveis:', error);
      this.errorMessage.set('Erro ao carregar dados dos imóveis.');
      this.loading.set(false);
    });
  }

  /**
   * Formata preço para exibição
   */
  formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(preco);
  }

  /**
   * Obtém URL da primeira imagem do imóvel
   */
  getImagemUrl(imovel: Imovel): string {
    if (imovel.imagens && imovel.imagens.length > 0) {
      return imovel.imagens[0].url;
    }
    return '/images/placeholder-imovel.jpg';
  }

  /**
   * Remove imóvel dos favoritos
   */
  removerFavorito(imovel: Imovel): void {
    const user = this.currentUser();
    if (!user) return;

    this.alertService.confirm(
      'Remover dos Favoritos',
      `Tem certeza que deseja remover "${imovel.titulo}" dos seus favoritos?`,
      'Sim, remover',
      'Cancelar',
      'question'
    ).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      // Encontra o favorito correspondente
      const favorito = this.favoritos().find(f => f.imovel_Id === imovel.id);
      if (!favorito) return;

      this.favoritoService.remove(favorito.id).subscribe({
        next: () => {
          // Atualiza a lista local
          this.favoritos.set(this.favoritos().filter(f => f.id !== favorito.id));
          this.imoveis.set(this.imoveis().filter(i => i.id !== imovel.id));
        },
        error: (error) => {
          console.error('Erro ao remover favorito:', error);
          this.alertService.error('Erro', 'Erro ao remover dos favoritos. Tente novamente.');
        }
      });
    });
  }

  /**
   * Limpa todos os favoritos
   */
  limparFavoritos(): void {
    this.alertService.confirmDanger(
      'Limpar Todos os Favoritos',
      'Tem certeza que deseja remover todos os imóveis dos seus favoritos?',
      'Sim, limpar tudo',
      'Cancelar'
    ).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      const user = this.currentUser();
      if (!user) return;

      this.loading.set(true);

      // Remove todos os favoritos
      const favoritos = this.favoritos();
      const removals = favoritos.map(favorito =>
        this.favoritoService.remove(favorito.id).toPromise()
      );

      Promise.all(removals).then(() => {
        this.favoritos.set([]);
        this.imoveis.set([]);
        this.loading.set(false);
        this.alertService.success('Sucesso', 'Todos os favoritos foram removidos.');
      }).catch(error => {
        console.error('Erro ao remover favoritos:', error);
        this.alertService.error('Erro', 'Erro ao remover favoritos. Tente novamente.');
        this.loading.set(false);
      });
    });
  }

  /**
   * Verifica se há favoritos
   */
  temFavoritos(): boolean {
    return this.imoveis().length > 0;
  }
}
