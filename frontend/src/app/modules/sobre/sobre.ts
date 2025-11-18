import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-sobre',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sobre.html',
  styleUrls: ['./sobre.scss'],
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ opacity: 0, height: 0, transform: 'translateY(-20px)' }),
        animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          style({ opacity: 1, height: '*', transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          style({ opacity: 0, height: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
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
      description: 'Busca constante pela excelência em cada detalhe do atendimento',
      detalhes: 'Acredito que cada cliente merece o melhor. Por isso, invisto constantemente em atualização profissional, tecnologia e processos que garantem um serviço de excelência, desde o primeiro contato até o fechamento do negócio.',
      color: '#3498db'
    },
    {
      icon: 'favorite',
      title: 'Comprometimento',
      description: 'Dedicação total ao sucesso de cada cliente',
      detalhes: 'Seu objetivo é o meu objetivo. Trabalho incansavelmente para entender suas necessidades e encontrar a solução perfeita. Estarei ao seu lado em cada etapa do processo, garantindo que você se sinta seguro e confiante.',
      color: '#2980b9'
    },
    {
      icon: 'psychology',
      title: 'Profissionalismo',
      description: 'Ética e profissionalismo em todas as negociações',
      detalhes: 'A confiança é a base de qualquer relação duradoura. Atuo sempre com transparência, ética e respeito, seguindo rigorosamente as normas do mercado imobiliário e zelando pelos interesses de todos os envolvidos.',
      color: '#5dade2'
    },
    {
      icon: 'verified_user',
      title: 'Transparência',
      description: 'Clareza e honestidade em todas as etapas',
      detalhes: 'Mantenho você informado sobre cada detalhe do processo. Sem surpresas, sem letras miúdas. Acredito que a transparência é fundamental para construir relações de confiança e garantir negociações justas para todos.',
      color: '#34495e'
    }
  ];

  // Controle do valor selecionado
  valorSelecionado: number | null = null;

  // Método para selecionar/desselecionar valor
  selecionarValor(index: number): void {
    this.valorSelecionado = this.valorSelecionado === index ? null : index;
  }
}
