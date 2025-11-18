import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sobre',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sobre.html',
  styleUrls: ['./sobre.scss']
})
export class Sobre {
  // Dados do corretor
  corretor = {
    nome: 'Jenisson Luckwü',
    creci: 'CRECI 11639',
    foto: '/images/imagemperfil.jpg',
    cargo: 'Corretor e Consultor Imobiliário',
    portfolioAtivo: '30',
    anosExperiencia: '10',
    clientesSatisfeitos: '200+',
    imoveisVendidos: '150+'
  };

  // Diferenciais
  diferenciais = [
    {
      icon: 'verified',
      title: 'Experiência Comprovada',
      description: 'Mais de 10 anos de atuação no mercado imobiliário de João Pessoa'
    },
    {
      icon: 'security',
      title: 'Segurança e Transparência',
      description: 'Processos transparentes com total segurança jurídica em todas as transações'
    },
    {
      icon: 'analytics',
      title: 'Conhecimento do Mercado',
      description: 'Análise completa do mercado para garantir o melhor investimento'
    },
    {
      icon: 'support_agent',
      title: 'Atendimento Personalizado',
      description: 'Consultoria especializada focada nas suas necessidades específicas'
    },
    {
      icon: 'handshake',
      title: 'Compromisso com Resultados',
      description: 'Foco total no seu resultado e na sua tranquilidade'
    },
    {
      icon: 'home_work',
      title: 'Portfólio Diversificado',
      description: 'Mais de 30 imóveis ativos para venda e locação'
    }
  ];

  // Valores
  valores = [
    {
      icon: 'star',
      title: 'Excelência',
      description: 'Busca constante pela excelência em cada detalhe do atendimento'
    },
    {
      icon: 'favorite',
      title: 'Comprometimento',
      description: 'Dedicação total ao sucesso de cada cliente'
    },
    {
      icon: 'psychology',
      title: 'Profissionalismo',
      description: 'Ética e profissionalismo em todas as negociações'
    }
  ];
}
