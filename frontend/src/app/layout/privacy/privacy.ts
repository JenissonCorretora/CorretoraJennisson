import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss'
})
export class Privacy {
  lastUpdate = '18 de Novembro de 2024';

  sections = [
    {
      title: '1. Informações que Coletamos',
      content: `Coletamos informações que você nos fornece diretamente ao criar uma conta, fazer buscas, salvar favoritos ou entrar em contato conosco. Isso pode incluir seu nome, endereço de e-mail, número de telefone, preferências de imóveis e outras informações que você optar por fornecer.`
    },
    {
      title: '2. Uso das Informações',
      content: `Utilizamos as informações coletadas para fornecer, manter e melhorar nossos serviços, processar suas solicitações, enviar notificações sobre imóveis de seu interesse, responder às suas perguntas e fornecer suporte ao cliente. Também podemos usar suas informações para personalizar sua experiência e enviar comunicações de marketing, com sua permissão.`
    },
    {
      title: '3. Compartilhamento de Informações',
      content: `Não vendemos suas informações pessoais a terceiros. Podemos compartilhar suas informações com proprietários de imóveis e corretores parceiros quando você demonstra interesse em uma propriedade específica. Também podemos compartilhar informações com prestadores de serviços que nos auxiliam nas operações do site, sempre sob obrigações de confidencialidade.`
    },
    {
      title: '4. Cookies e Tecnologias Similares',
      content: `Utilizamos cookies e tecnologias similares para melhorar sua experiência de navegação, analisar tendências, administrar o site e coletar informações demográficas sobre nossa base de usuários. Você pode controlar o uso de cookies nas configurações do seu navegador, mas isso pode afetar a funcionalidade do site.`
    },
    {
      title: '5. Segurança dos Dados',
      content: `Implementamos medidas de segurança técnicas e organizacionais adequadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum método de transmissão pela Internet ou armazenamento eletrônico é 100% seguro, e não podemos garantir segurança absoluta.`
    },
    {
      title: '6. Seus Direitos',
      content: `Você tem o direito de acessar, corrigir, atualizar ou excluir suas informações pessoais a qualquer momento. Você também pode optar por não receber comunicações de marketing. Para exercer esses direitos, entre em contato conosco através dos canais disponíveis em nosso site.`
    },
    {
      title: '7. Retenção de Dados',
      content: `Retemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos descritos nesta política, a menos que um período de retenção mais longo seja exigido ou permitido por lei. Quando suas informações não forem mais necessárias, as excluiremos ou anonimizaremos de forma segura.`
    },
    {
      title: '8. Privacidade de Menores',
      content: `Nosso site não se destina a menores de 18 anos. Não coletamos intencionalmente informações pessoais de crianças. Se descobrirmos que coletamos inadvertidamente informações de um menor, tomaremos medidas para excluir essas informações o mais rápido possível.`
    },
    {
      title: '9. Alterações nesta Política',
      content: `Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas práticas ou por outros motivos operacionais, legais ou regulatórios. Notificaremos você sobre quaisquer alterações significativas publicando a nova política neste site e atualizando a data da "Última atualização".`
    },
    {
      title: '10. Lei Geral de Proteção de Dados (LGPD)',
      content: `Estamos em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) do Brasil. Respeitamos todos os direitos dos titulares de dados conforme estabelecido pela LGPD, incluindo o direito à confirmação da existência de tratamento, acesso aos dados, correção, anonimização, bloqueio ou eliminação de dados desnecessários.`
    },
    {
      title: '11. Contato',
      content: `Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos suas informações pessoais, entre em contato conosco através dos canais disponíveis em nosso site ou diretamente com nosso corretor responsável Jenisson Luckwü (CRECI 11639).`
    }
  ];
}

