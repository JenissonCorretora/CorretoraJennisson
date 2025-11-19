import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ImovelService, Imovel, StatusImovel } from '../../services/imovel.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit, OnDestroy {
  private resizeListener: any;
  featuredImoveis: Imovel[] = [];
  loadingFeatured = false;
  featuredError = '';
  // Serviços/Categorias disponíveis
  services = [
    {
      icon: 'business',
      title: 'Loja Comercial',
      description: 'Imóveis comerciais',
      count: 120
    },
    {
      icon: 'home',
      title: 'Casas',
      description: 'Casas residenciais',
      count: 89
    },
    {
      icon: 'apartment',
      title: 'Apartamentos',
      description: 'Apartamentos modernos',
      count: 156
    },
    {
      icon: 'star',
      title: 'Destaques',
      description: 'Imóveis em destaque',
      count: 45
    },
    {
      icon: 'location_city',
      title: 'Prédios',
      description: 'Prédios comerciais',
      count: 23
    },
    {
      icon: 'shopping_cart',
      title: 'Comprar',
      description: 'Imóveis à venda',
      count: 234
    }
  ];

  // Controle do carrossel
  currentIndex = 0;
  itemsPerView = 3;

  constructor(private imovelService: ImovelService) {}

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
    console.log(`Filtrar por categoria: ${category}`);
    // TODO: Implementar navegação com filtro
  }

  /**
   * Busca por imóveis
   */
  searchProperties(event: Event): void {
    event.preventDefault();
    console.log('Buscar imóveis...');
    // TODO: Implementar busca
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
        const disponiveis = imoveis
          .filter(imovel => imovel.status === StatusImovel.Disponivel)
          .sort((a, b) => {
            const dataA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dataB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dataB - dataA;
          });

        this.featuredImoveis = disponiveis.slice(0, 3);
        this.loadingFeatured = false;
      },
      error: (error) => {
        console.error('Erro ao carregar imóveis em destaque:', error);
        this.featuredError = 'Não foi possível carregar os imóveis em destaque no momento.';
        this.loadingFeatured = false;
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
}

