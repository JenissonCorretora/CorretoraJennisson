import { Component, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute, ParamMap } from '@angular/router';
import { ImovelService, Imovel, StatusImovel, DEFAULT_TIPOS_IMOVEL } from '../../services/imovel.service';
import { FavoritoService } from '../../services/favorito.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-imoveis',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './imoveis.html',
  styleUrls: ['./imoveis.scss']
})
export class Imoveis implements OnInit {
  // Busca
  searchTerm = signal('');

  // Filtros
  tipoSelecionado = signal<string>('');
  cidadeSelecionada = signal<string>('');
  precoMin = signal<number | null>(null);
  precoMax = signal<number | null>(null);
  statusSelecionado = signal<StatusImovel | ''>('');

  // Ordenação
  ordenacao = signal<string>('relevante');
  itensPorPagina = signal<number>(12);
  paginaAtual = signal<number>(1);

  // Estados
  loading = signal(false);
  errorMessage = signal('');

  // Dados
  imoveis = signal<Imovel[]>([]);
  favoritosIds = signal<Set<number>>(new Set());

  // Estado de autenticação (será inicializado no constructor)
  isLoggedIn = signal(false);
  currentUser = signal<any>(null);

  // Opções de filtros (serão carregadas dinamicamente)
  tipos = signal<string[]>([...DEFAULT_TIPOS_IMOVEL]);
  statusOptions = Object.values(StatusImovel);
  cidades = signal<string[]>([]);

  constructor(
    private imovelService: ImovelService,
    private favoritoService: FavoritoService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService
  ) {
    // Inicializa signals de autenticação
    this.isLoggedIn = this.authService.isAuthenticated;
    this.currentUser = this.authService.currentUser;

    // Effect para recarregar favoritos quando o usuário logar
    effect(() => {
      if (this.isLoggedIn() && this.currentUser()) {
        this.carregarFavoritos();
      } else {
        this.favoritosIds.set(new Set());
      }
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.aplicarQueryParams(params);
    });

    this.carregarImoveis();
    if (this.isLoggedIn()) {
      this.carregarFavoritos();
    }
  }

  /**
   * Carrega todos os imóveis da API
   */
  carregarImoveis(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.imovelService.getAll().subscribe({
      next: (imoveis) => {
        this.imoveis.set(imoveis);
        this.extrairCidades(imoveis);
        this.extrairTipos(imoveis);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar imóveis:', error);
        this.errorMessage.set('Erro ao carregar imóveis. Tente novamente mais tarde.');
        this.loading.set(false);
      }
    });
  }

  /**
   * Extrai lista única de cidades dos imóveis
   */
  private extrairCidades(imoveis: Imovel[]): void {
    const cidadesSet = new Set<string>();

    imoveis.forEach(imovel => {
      if (imovel.cidade) cidadesSet.add(imovel.cidade);
    });

    this.cidades.set(Array.from(cidadesSet).sort());
  }

  private titleCase(value: string): string {
    if (!value) return '';
    return value
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  /**
   * Extrai lista única de tipos dos imóveis
   */
  private extrairTipos(imoveis: Imovel[]): void {
    const tiposSet = new Set<string>();

    imoveis.forEach(imovel => {
      const tipo = (imovel.tipoImovel || '').trim();
      if (tipo) {
        tiposSet.add(this.titleCase(tipo));
      }
    });

    if (tiposSet.size === 0) {
      this.tipos.set([...DEFAULT_TIPOS_IMOVEL]);
      return;
    }

    this.tipos.set(Array.from(tiposSet).sort());
  }

  /**
   * Carrega favoritos do usuário logado
   */
  carregarFavoritos(): void {
    const user = this.currentUser();
    if (!user) return;

    this.favoritoService.getByUsuarioId(user.userId).subscribe({
      next: (favoritos) => {
        const ids = new Set(favoritos.map(f => f.imovel_Id));
        this.favoritosIds.set(ids);
      },
      error: (error) => {
        console.error('Erro ao carregar favoritos:', error);
        // Não mostra erro para o usuário, apenas loga
      }
    });
  }

  /**
   * Verifica se um imóvel está favoritado
   */
  isFavoritado(imovelId: number): boolean {
    return this.favoritosIds().has(imovelId);
  }

  /**
   * Imóveis filtrados e ordenados
   */
  imoveisFiltrados = computed(() => {
    let resultado = [...this.imoveis()];

    // Filtro por busca (título, endereco, descrição)
    const busca = this.searchTerm().toLowerCase();
    if (busca) {
      resultado = resultado.filter(imovel =>
        imovel.titulo?.toLowerCase().includes(busca) ||
        imovel.endereco?.toLowerCase().includes(busca) ||
        imovel.descricao?.toLowerCase().includes(busca) ||
        imovel.cidade?.toLowerCase().includes(busca)
      );
    }

    // Filtro por tipo
    const tipoSelecionado = this.tipoSelecionado().toLowerCase();
    if (tipoSelecionado) {
      resultado = resultado.filter(imovel =>
        (imovel.tipoImovel || '').toLowerCase() === tipoSelecionado
      );
    }

    // Filtro por cidade
    if (this.cidadeSelecionada()) {
      resultado = resultado.filter(imovel => imovel.cidade === this.cidadeSelecionada());
    }

    // Filtro por status
    if (this.statusSelecionado()) {
      resultado = resultado.filter(imovel => imovel.status === this.statusSelecionado());
    }

    // Filtro por preço
    if (this.precoMin() !== null) {
      resultado = resultado.filter(imovel => imovel.preco >= this.precoMin()!);
    }
    if (this.precoMax() !== null) {
      resultado = resultado.filter(imovel => imovel.preco <= this.precoMax()!);
    }

    // Ordenação
    switch (this.ordenacao()) {
      case 'preco-asc':
        resultado.sort((a, b) => a.preco - b.preco);
        break;
      case 'preco-desc':
        resultado.sort((a, b) => b.preco - a.preco);
        break;
      default:
        // Relevante - mantém ordem original
        break;
    }

    return resultado;
  });

  // Paginação
  totalPaginas = computed(() =>
    Math.ceil(this.imoveisFiltrados().length / this.itensPorPagina())
  );

  paginasArray = computed(() => {
    const total = this.totalPaginas();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  imoveisPagina = computed(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina();
    const fim = inicio + this.itensPorPagina();
    return this.imoveisFiltrados().slice(inicio, fim);
  });

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
    // Imagem padrão ou placeholder
    return '/images/placeholder-imovel.jpg';
  }

  /**
   * Toggle favorito (requer login)
   */
  toggleFavorito(imovel: Imovel): void {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    const user = this.currentUser();
    if (!user) return;

    const isFavoritado = this.isFavoritado(imovel.id);

    if (isFavoritado) {
      // Remove favorito
      this.favoritoService.getByUsuarioAndImovel(user.userId, imovel.id).subscribe({
        next: (favorito) => {
          if (!favorito) {
            // Se não encontrou, apenas atualiza o estado local
            const ids = new Set(this.favoritosIds());
            ids.delete(imovel.id);
            this.favoritosIds.set(ids);
            return;
          }

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
              this.alertService.error('Erro', 'Erro ao remover dos favoritos. Tente novamente.');
            }
          });
        },
        error: (error) => {
          if (error.status === 404) {
            // Já não está favoritado, apenas atualiza o estado local
            const ids = new Set(this.favoritosIds());
            ids.delete(imovel.id);
            this.favoritosIds.set(ids);
          }
        }
      });
    } else {
      // Adiciona favorito
      this.favoritoService.add(imovel.id).subscribe({
        next: () => {
          const ids = new Set(this.favoritosIds());
          ids.add(imovel.id);
          this.favoritosIds.set(ids);
        },
        error: (error) => {
          console.error('Erro ao adicionar favorito:', error);
          this.alertService.error('Erro', 'Erro ao adicionar aos favoritos. Tente novamente.');
        }
      });
    }
  }

  /**
   * Limpar todos os filtros
   */
  limparFiltros(): void {
    this.searchTerm.set('');
    this.tipoSelecionado.set('');
    this.cidadeSelecionada.set('');
    this.precoMin.set(null);
    this.precoMax.set(null);
    this.statusSelecionado.set('');
    this.paginaAtual.set(1);
  }

  /**
   * Navegar para próxima página
   */
  proximaPagina(): void {
    if (this.paginaAtual() < this.totalPaginas()) {
      this.paginaAtual.set(this.paginaAtual() + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Navegar para página anterior
   */
  paginaAnterior(): void {
    if (this.paginaAtual() > 1) {
      this.paginaAtual.set(this.paginaAtual() - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Ir para página específica
   */
  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaAtual.set(pagina);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Quando filtros mudam, resetar para primeira página
   */
  onFiltroChange(): void {
    this.paginaAtual.set(1);
  }

  /**
   * Aplica filtros recebidos via query params
   */
  private aplicarQueryParams(params: ParamMap): void {
    const search = params.get('search');
    this.searchTerm.set(search ?? '');

    const tipo = params.get('tipo');
    this.tipoSelecionado.set(tipo ? this.titleCase(tipo) : '');

    const status = params.get('status');
    this.statusSelecionado.set(this.isStatusImovel(status) ? status : '');

    const cidade = params.get('cidade');
    this.cidadeSelecionada.set(cidade ?? '');

    const precoMin = this.toNumber(params.get('precoMin'));
    const precoMax = this.toNumber(params.get('precoMax'));
    this.precoMin.set(precoMin ?? null);
    this.precoMax.set(precoMax ?? null);

    if (params.keys.length > 0) {
      this.paginaAtual.set(1);
    }
  }

  private toNumber(value: string | null): number | undefined {
    if (!value) return undefined;
    const parsed = Number(value);
    return isNaN(parsed) ? undefined : parsed;
  }

  private isStatusImovel(value: string | null): value is StatusImovel {
    if (!value) return false;
    return Object.values(StatusImovel).includes(value as StatusImovel);
  }
}
