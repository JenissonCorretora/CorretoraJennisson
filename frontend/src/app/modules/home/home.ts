import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ImovelService, Imovel, StatusImovel, DEFAULT_TIPOS_IMOVEL } from '../../services/imovel.service';

interface ServiceCategory {
  icon: string;
  title: string;
  description: string;
  count: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit, OnDestroy {
  private resizeListener: any;
  featuredImoveis: Imovel[] = [];
  loadingFeatured = false;
  featuredError = '';
  searchLocation = '';
  searchTipo = '';
  searchPriceRange = '';
  availableTipos: string[] = [...DEFAULT_TIPOS_IMOVEL];

  // Serviços/Categorias disponíveis
  services: ServiceCategory[] = [];

  private readonly iconMap: Record<string, string> = {
    casa: 'home',
    apartamento: 'apartment',
    terreno: 'park',
    sitio: 'villa',
    sítio: 'villa',
    chacara: 'villa',
    chácara: 'villa',
    fazenda: 'forest',
    loft: 'domain',
    kitnet: 'roofing',
    cobertura: 'pentagon',
    predio: 'location_city',
    prédio: 'location_city',
    comercial: 'business',
    loja: 'storefront',
    galpao: 'warehouse',
    galpão: 'warehouse',
    sala: 'meeting_room',
    studio: 'chair',
    estúdio: 'chair'
  };

  // Controle do carrossel
  currentIndex = 0;
  itemsPerView = 3;

  constructor(
    private imovelService: ImovelService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.updateItemsPerView();
    this.resizeListener = () => this.updateItemsPerView();
    window.addEventListener('resize', this.resizeListener);
    this.carregarDestaques();
  }

  ngOnDestroy() {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  /**
   * Atualiza quantos items mostrar baseado na largura da tela
   */
  updateItemsPerView(): void {
    const width = window.innerWidth;
    if (width < 768) {
      this.itemsPerView = 1; // Mobile: 1 card
    } else if (width < 992) {
      this.itemsPerView = 2; // Tablet: 2 cards
    } else {
      this.itemsPerView = 3; // Desktop: 3 cards
    }

    // Reset index se estiver fora do alcance permitido
    const maxIndex = this.getMaxIndex();
    if (this.currentIndex > maxIndex) {
      this.currentIndex = maxIndex;
    }
  }

  // Touch/Swipe
  touchStartX = 0;
  touchEndX = 0;

  // Depoimentos de clientes
  testimonials = [
    {
      name: 'Maria Silva',
      role: 'Cliente Satisfeita',
      image: 'https://ui-avatars.com/api/?name=Maria+Silva&background=3498db&color=fff&size=200',
      text: 'Excelente atendimento! Encontrei o imóvel dos meus sonhos com a ajuda da equipe.'
    },
    {
      name: 'João Santos',
      role: 'Comprador',
      image: 'https://ui-avatars.com/api/?name=Joao+Santos&background=2c3e50&color=fff&size=200',
      text: 'Profissionais muito atenciosos e comprometidos. Recomendo!'
    },
    {
      name: 'Ana Costa',
      role: 'Investidora',
      image: 'https://ui-avatars.com/api/?name=Ana+Costa&background=e74c3c&color=fff&size=200',
      text: 'Ótima experiência! Processo rápido e transparente do início ao fim.'
    }
  ];

  /**
   * Navega para a página de imóveis com filtro
   */
  filterByCategory(category: string): void {
    const queryParams: Record<string, any> = {};
    queryParams['tipo'] = this.titleCase(category);

    this.navigateToImoveis(queryParams);
  }

  /**
   * Busca por imóveis
   */
  searchProperties(event: Event): void {
    event.preventDefault();
    const queryParams: Record<string, any> = {};

    const location = this.searchLocation.trim();
    if (location) {
      queryParams['search'] = location;
    }

    if (this.searchTipo) {
      queryParams['tipo'] = this.searchTipo;
    }

    const { precoMin, precoMax } = this.parsePriceRange(this.searchPriceRange);
    if (precoMin !== undefined) {
      queryParams['precoMin'] = precoMin;
    }
    if (precoMax !== undefined) {
      queryParams['precoMax'] = precoMax;
    }

    this.navigateToImoveis(queryParams);
  }

  /**
   * Sanitiza o campo de faixa de preço permitindo apenas números e um hífen
   */
  onPriceRangeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9-]/g, '');

    // Garante apenas um hífen
    const firstHyphen = value.indexOf('-');
    if (firstHyphen !== -1) {
      const beforeHyphen = value.slice(0, firstHyphen + 1);
      const afterHyphen = value.slice(firstHyphen + 1).replace(/-/g, '');
      value = beforeHyphen + afterHyphen;
    }

    const hasHyphen = value.includes('-');
    let [minPart, maxPart = ''] = value.split('-');
    minPart = this.limitDigits(minPart);
    maxPart = this.limitDigits(maxPart);

    const limitedValue = hasHyphen ? `${minPart}-${maxPart}` : minPart;

    const formatted = this.formatPriceRange(limitedValue);
    this.searchPriceRange = formatted;
    input.value = formatted;
  }

  /**
   * Navega para o próximo item do carrossel
   */
  nextSlide(): void {
    const maxIndex = this.getMaxIndex();
    if (this.currentIndex < maxIndex) {
      this.currentIndex++;
    }
  }

  /**
   * Navega para o item anterior do carrossel
   */
  prevSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  /**
   * Verifica se pode navegar para o próximo
   */
  canGoNext(): boolean {
    const maxIndex = Math.max(0, this.services.length - this.itemsPerView);
    return this.currentIndex < maxIndex;
  }

  /**
   * Verifica se pode navegar para o anterior
   */
  canGoPrev(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Retorna o índice máximo permitido
   */
  getMaxIndex(): number {
    return Math.max(0, this.services.length - this.itemsPerView);
  }

  /**
   * Retorna o estilo de transformação do carrossel
   */
  getCarouselTransform(): string {
    return `translateX(-${this.currentIndex * (100 / this.itemsPerView)}%)`;
  }

  /**
   * Inicia o toque/arrasto
   */
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  /**
   * Finaliza o toque/arrasto e detecta direção
   */
  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  /**
   * Processa o swipe e navega
   */
  handleSwipe(): void {
    const swipeThreshold = 50; // Mínimo de 50px para considerar swipe
    const difference = this.touchStartX - this.touchEndX;

    if (Math.abs(difference) > swipeThreshold) {
      if (difference > 0) {
        // Swipe para esquerda = próximo
        this.nextSlide();
      } else {
        // Swipe para direita = anterior
        this.prevSlide();
      }
    }
  }

  /**
   * Carrega os imóveis em destaque (status disponível mais recentes) limitando em 3
   */
  private carregarDestaques(): void {
    this.loadingFeatured = true;
    this.featuredError = '';

    this.imovelService.getAll().subscribe({
      next: (imoveis) => {
        // Filtra apenas imóveis ativos (considera true ou undefined/null como ativo para compatibilidade)
        const ativos = imoveis.filter(imovel => imovel.ativo !== false);
        const disponiveis = ativos
          .filter(imovel => imovel.status === StatusImovel.Disponivel)
          .sort((a, b) => {
            const dataA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dataB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dataB - dataA;
          });

        this.featuredImoveis = disponiveis.slice(0, 3);
        this.atualizarTipos(ativos);
        this.atualizarCategorias(ativos);
        this.loadingFeatured = false;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar imóveis em destaque:', error);
        this.featuredError = 'Não foi possível carregar os imóveis em destaque no momento.';
        this.loadingFeatured = false;
        this.services = [];
        this.cdRef.detectChanges();
      }
    });
  }

  formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  }

  getImagemUrl(imovel: Imovel): string {
    if (imovel.imagens && imovel.imagens.length > 0) {
      return imovel.imagens[0].url;
    }
    return '/images/placeholder-imovel.jpg';
  }

  /**
   * Realiza navegação para a página de imóveis com filtros aplicados
   */
  private navigateToImoveis(queryParams: Record<string, any>): void {
    this.router.navigate(['/imoveis'], {
      queryParams
    });
  }

  /**
   * Converte texto de faixa de preço em valores numéricos
   */
  private parsePriceRange(input: string): { precoMin?: number; precoMax?: number } {
    if (!input) return {};

    const sanitized = input
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(/[^0-9-]/g, '');
    const parseValue = (value: string) => {
      const numeric = parseInt(value.replace(/\D/g, ''), 10);
      return isNaN(numeric) ? undefined : numeric;
    };

    if (sanitized.includes('-')) {
      const [minValue, maxValue] = sanitized.split('-');
      const precoMin = parseValue(minValue);
      const precoMax = parseValue(maxValue);
      return { precoMin, precoMax };
    }

    const precoMax = parseValue(sanitized);
    return { precoMax };
  }

  /**
   * Formata o texto da faixa de preço para exibição com separador de milhar
   */
  private formatPriceRange(value: string): string {
    if (!value) return '';

    const hasHyphen = value.includes('-');
    const [minRaw, maxRaw = ''] = value.split('-');

    const minFormatted = this.formatPriceValue(minRaw);
    const maxFormatted = this.formatPriceValue(maxRaw);

    if (hasHyphen) {
      const separator = ' - ';

      if (!minFormatted && !maxFormatted) {
        return separator;
      }

      if (!maxFormatted) {
        return `${minFormatted}${separator}`.trimEnd();
      }

      if (!minFormatted) {
        return `${separator}${maxFormatted}`.trimStart();
      }

      return `${minFormatted}${separator}${maxFormatted}`;
    }

    return minFormatted;
  }

  private formatPriceValue(value: string): string {
    if (!value) return '';
    const numeric = parseInt(value, 10);
    if (isNaN(numeric)) return '';
    return new Intl.NumberFormat('pt-BR').format(numeric);
  }

  private limitDigits(value: string): string {
    if (!value) return '';
    return value.replace(/\D/g, '').slice(0, 10);
  }

  private atualizarTipos(imoveis: Imovel[]): void {
    const tiposSet = new Set<string>();

    imoveis.forEach(imovel => {
      const tipo = (imovel.tipoImovel || '').trim();
      if (tipo) {
        tiposSet.add(this.titleCase(tipo));
      }
    });

    if (tiposSet.size === 0) {
      this.availableTipos = [...DEFAULT_TIPOS_IMOVEL];
      return;
    }

    this.availableTipos = Array.from(tiposSet).sort();
  }

  private atualizarCategorias(imoveis: Imovel[]): void {
    if (!imoveis || imoveis.length === 0) {
      this.services = [];
      return;
    }

    const categoriasMap = new Map<string, number>();

    imoveis.forEach(imovel => {
      const tipo = this.titleCase(imovel.tipoImovel || '');
      if (!tipo) return;
      const quantidadeAtual = categoriasMap.get(tipo) || 0;
      categoriasMap.set(tipo, quantidadeAtual + 1);
    });

    const categoriasOrdenadas = Array.from(categoriasMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    this.services = categoriasOrdenadas.map(([tipo, count]) => ({
      icon: this.getIconForTipo(tipo),
      title: tipo,
      description: `${count} imóvel${count > 1 ? 'eis' : ''} disponível${count > 1 ? 's' : ''}`,
      count
    }));
  }

  private getIconForTipo(tipo: string): string {
    const normalized = (tipo || '').toLowerCase();
    for (const key of Object.keys(this.iconMap)) {
      if (normalized.includes(key)) {
        return this.iconMap[key];
      }
    }
    return 'other_houses';
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
}

