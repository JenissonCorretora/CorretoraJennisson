import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home {
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
}

