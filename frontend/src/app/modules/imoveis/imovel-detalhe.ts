import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ImovelService, Imovel } from '../../services/imovel.service';
import { FavoritoService } from '../../services/favorito.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-imovel-detalhe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './imovel-detalhe.html',
  styleUrls: ['./imovel-detalhe.scss']
})
export class ImovelDetalhe implements OnInit {
  loading = signal(true);
  errorMessage = signal('');
  imovel = signal<Imovel | null>(null);
  galleryIndex = signal(0);
  favoritosIds = signal<Set<number>>(new Set());

  isLoggedIn = signal(false);
  currentUser = signal<any>(null);

  imagens = computed(() => this.imovel()?.imagens ?? []);
  imagemAtual = computed(() => this.imagens()[this.galleryIndex()]?.url ?? '/images/placeholder-imovel.jpg');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private imovelService: ImovelService,
    private favoritoService: FavoritoService,
    private authService: AuthService,
    private alertService: AlertService
  ) {
    this.isLoggedIn = this.authService.isAuthenticated;
    this.currentUser = this.authService.currentUser;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/imoveis']);
      return;
    }

    this.carregarImovel(id);

    if (this.isLoggedIn()) {
      this.carregarFavoritos();
    }
  }

  voltarParaLista(): void {
    this.router.navigate(['/imoveis']);
  }

  irParaContato(): void {
    if (!this.imovel()) return;
    this.router.navigate(['/contato'], { queryParams: { imovel: this.imovel()!.id } });
  }

  private carregarImovel(id: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.imovelService.getById(id).subscribe({
      next: (imovel) => {
        // Verifica se o imóvel está desabilitado (apenas se o campo existir e for false)
        if (imovel.ativo === false) {
          this.errorMessage.set('Este imóvel não está disponível no momento.');
          this.imovel.set(null);
          this.loading.set(false);
          return;
        }
        this.imovel.set(imovel);
        this.galleryIndex.set(0);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar imóvel:', error);
        this.errorMessage.set('Não foi possível carregar os dados deste imóvel.');
        this.loading.set(false);
      }
    });
  }

  private carregarFavoritos(): void {
    const user = this.currentUser();
    if (!user) return;

    this.favoritoService.getByUsuarioId(user.userId).subscribe({
      next: (favoritos) => {
        const ids = new Set(favoritos.map(f => f.imovel_Id));
        this.favoritosIds.set(ids);
      },
      error: (error) => console.warn('Erro ao carregar favoritos:', error)
    });
  }

  isFavoritado(): boolean {
    const imovel = this.imovel();
    if (!imovel) return false;
    return this.favoritosIds().has(imovel.id);
  }

  toggleFavorito(): void {
    const imovel = this.imovel();
    if (!imovel) return;

    if (!this.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    const user = this.currentUser();
    if (!user) return;

    if (this.isFavoritado()) {
      this.favoritoService.getByUsuarioAndImovel(user.userId, imovel.id).subscribe({
        next: (favorito) => {
          if (!favorito) return;
          this.favoritoService.remove(favorito.id).subscribe({
            next: () => {
              const ids = new Set(this.favoritosIds());
              ids.delete(imovel.id);
              this.favoritosIds.set(ids);
            },
            error: (error) => {
              console.error('Erro ao remover favorito:', error);
              if (error.status === 200 || error.statusText === 'OK') {
                const ids = new Set(this.favoritosIds());
                ids.delete(imovel.id);
                this.favoritosIds.set(ids);
                return;
              }
              this.alertService.error('Erro', 'Erro ao remover favorito.');
            }
          });
        }
      });
    } else {
      this.favoritoService.add(imovel.id).subscribe({
        next: () => {
          const ids = new Set(this.favoritosIds());
          ids.add(imovel.id);
          this.favoritosIds.set(ids);
        },
        error: (error) => {
          console.error('Erro ao adicionar favorito:', error);
          this.alertService.error('Erro', 'Erro ao adicionar favorito.');
        }
      });
    }
  }

  selecionarImagem(index: number): void {
    if (index >= 0 && index < this.imagens().length) {
      this.galleryIndex.set(index);
    }
  }

  getImagemUrl(imovel: Imovel | null): string {
    if (imovel?.imagens && imovel.imagens.length > 0) {
      return imovel.imagens[0].url;
    }
    return '/images/placeholder-imovel.jpg';
  }

  public formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  }
}

