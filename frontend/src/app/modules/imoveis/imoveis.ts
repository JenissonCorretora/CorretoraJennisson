import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Imovel {
  id: number;
  titulo: string;
  tipo: string; // 'Casa', 'Apartamento', 'Terreno', etc.
  localizacao: string;
  bairro: string;
  cidade: string;
  preco: number;
  quartos?: number;
  banheiros?: number;
  area?: number; // em m²
  vagas?: number;
  imagem?: string;
  descricao: string;
  favoritado?: boolean;
}

@Component({
  selector: 'app-imoveis',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './imoveis.html',
  styleUrls: ['./imoveis.scss']
})
export class Imoveis {
  // Busca
  searchTerm = signal('');

  // Filtros
  tipoSelecionado = signal<string>('');
  cidadeSelecionada = signal<string>('');
  bairroSelecionado = signal<string>('');
  precoMin = signal<number | null>(null);
  precoMax = signal<number | null>(null);
  quartosSelecionados = signal<number | null>(null);
  banheirosSelecionados = signal<number | null>(null);

  // Ordenação
  ordenacao = signal<string>('relevante'); // 'relevante', 'preco-asc', 'preco-desc', 'maior-area'
  itensPorPagina = signal<number>(12);
  paginaAtual = signal<number>(1);

  // Estado de login (simulado - depois conectar com serviço de auth)
  isLoggedIn = signal(false);

  // Dados de exemplo (depois será substituído por chamada à API)
  imoveis = signal<Imovel[]>([
    {
      id: 1,
      titulo: 'Casa moderna com 3 quartos',
      tipo: 'Casa',
      localizacao: 'Manaíra',
      bairro: 'Manaíra',
      cidade: 'João Pessoa',
      preco: 450000,
      quartos: 3,
      banheiros: 2,
      area: 150,
      vagas: 2,
      descricao: 'Casa moderna em ótima localização, próximo à praia.',
      favoritado: false
    },
    {
      id: 2,
      titulo: 'Apartamento 2 quartos',
      tipo: 'Apartamento',
      localizacao: 'Tambaú',
      bairro: 'Tambaú',
      cidade: 'João Pessoa',
      preco: 320000,
      quartos: 2,
      banheiros: 2,
      area: 80,
      vagas: 1,
      descricao: 'Apartamento bem localizado próximo ao centro comercial.',
      favoritado: false
    },
    {
      id: 3,
      titulo: 'Terreno 300m²',
      tipo: 'Terreno',
      localizacao: 'Bessa',
      bairro: 'Bessa',
      cidade: 'João Pessoa',
      preco: 280000,
      area: 300,
      descricao: 'Terreno plano, ideal para construção.',
      favoritado: false
    }
  ]);

  // Opções de filtros
  tipos = ['Casa', 'Apartamento', 'Terreno', 'Sobrado', 'Kitnet', 'Studio'];
  cidades = ['João Pessoa', 'Cabedelo', 'Bayeux', 'Santa Rita'];
  bairros = ['Manaíra', 'Tambaú', 'Bessa', 'Cabo Branco', 'Jardim Oceania'];
  opcoesQuartos = [1, 2, 3, 4, 5];
  opcoesBanheiros = [1, 2, 3, 4];

  // Imóveis filtrados e ordenados
  imoveisFiltrados = computed(() => {
    let resultado = [...this.imoveis()];

    // Filtro por busca (título, localização, descrição)
    const busca = this.searchTerm().toLowerCase();
    if (busca) {
      resultado = resultado.filter(imovel =>
        imovel.titulo.toLowerCase().includes(busca) ||
        imovel.localizacao.toLowerCase().includes(busca) ||
        imovel.descricao.toLowerCase().includes(busca) ||
        imovel.bairro.toLowerCase().includes(busca) ||
        imovel.cidade.toLowerCase().includes(busca)
      );
    }

    // Filtro por tipo
    if (this.tipoSelecionado()) {
      resultado = resultado.filter(imovel => imovel.tipo === this.tipoSelecionado());
    }

    // Filtro por cidade
    if (this.cidadeSelecionada()) {
      resultado = resultado.filter(imovel => imovel.cidade === this.cidadeSelecionada());
    }

    // Filtro por bairro
    if (this.bairroSelecionado()) {
      resultado = resultado.filter(imovel => imovel.bairro === this.bairroSelecionado());
    }

    // Filtro por preço
    if (this.precoMin() !== null) {
      resultado = resultado.filter(imovel => imovel.preco >= this.precoMin()!);
    }
    if (this.precoMax() !== null) {
      resultado = resultado.filter(imovel => imovel.preco <= this.precoMax()!);
    }

    // Filtro por quartos
    if (this.quartosSelecionados() !== null) {
      resultado = resultado.filter(imovel => imovel.quartos === this.quartosSelecionados());
    }

    // Filtro por banheiros
    if (this.banheirosSelecionados() !== null) {
      resultado = resultado.filter(imovel => imovel.banheiros === this.banheirosSelecionados());
    }

    // Ordenação
    switch (this.ordenacao()) {
      case 'preco-asc':
        resultado.sort((a, b) => a.preco - b.preco);
        break;
      case 'preco-desc':
        resultado.sort((a, b) => b.preco - a.preco);
        break;
      case 'maior-area':
        resultado.sort((a, b) => (b.area || 0) - (a.area || 0));
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
   * Toggle favorito (requer login)
   */
  toggleFavorito(imovel: Imovel): void {
    if (!this.isLoggedIn()) {
      // TODO: Redirecionar para login ou mostrar modal
      alert('Faça login para adicionar aos favoritos');
      return;
    }

    // TODO: Implementar chamada à API
    imovel.favoritado = !imovel.favoritado;
    console.log(`Imóvel ${imovel.id} ${imovel.favoritado ? 'adicionado' : 'removido'} dos favoritos`);
  }

  /**
   * Limpar todos os filtros
   */
  limparFiltros(): void {
    this.searchTerm.set('');
    this.tipoSelecionado.set('');
    this.cidadeSelecionada.set('');
    this.bairroSelecionado.set('');
    this.precoMin.set(null);
    this.precoMax.set(null);
    this.quartosSelecionados.set(null);
    this.banheirosSelecionados.set(null);
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
}
