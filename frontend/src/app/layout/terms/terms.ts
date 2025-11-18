import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './terms.html',
  styleUrl: './terms.scss'
})
export class Terms {
  lastUpdate = '18 de Novembro de 2024';

  sections = [
    {
      title: '1. Aceitação dos Termos',
      content: `Ao acessar e usar este site, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá usar nosso site.`
    },
    {
      title: '2. Cadastro e Conta de Usuário',
      content: `Para acessar determinadas funcionalidades do site, você deve criar uma conta fornecendo informações precisas, completas e atualizadas. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorrem em sua conta. Você concorda em notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta.`
    },
    {
      title: '3. Uso do Serviço',
      content: `Você concorda em usar nosso site apenas para fins legais e de acordo com estes Termos. Você não deve usar o site de maneira que possa danificar, desabilitar, sobrecarregar ou comprometer nossos servidores ou redes. É proibido tentar obter acesso não autorizado a qualquer parte do site, outros sistemas ou redes conectados ao site.`
    },
    {
      title: '4. Propriedade Intelectual',
      content: `Todo o conteúdo presente neste site, incluindo textos, gráficos, logotipos, ícones, imagens, clipes de áudio e software, é de propriedade da Jenisson Luckwü Imóveis ou de seus fornecedores de conteúdo e é protegido por leis de direitos autorais. A reprodução, distribuição ou uso não autorizado deste conteúdo é estritamente proibida.`
    },
    {
      title: '5. Listagens de Imóveis',
      content: `As informações sobre imóveis apresentadas neste site são fornecidas por proprietários, corretores e outras fontes terceirizadas. Embora façamos todos os esforços para garantir a precisão das informações, não garantimos ou assumimos qualquer responsabilidade pela exatidão, completude ou atualização das listagens. Os usuários devem verificar todas as informações diretamente com o proprietário ou corretor responsável.`
    },
    {
      title: '6. Limitação de Responsabilidade',
      content: `A Jenisson Luckwü Imóveis não será responsável por quaisquer danos diretos, indiretos, incidentais, consequenciais ou punitivos decorrentes do uso ou incapacidade de usar nosso site. Isso inclui, sem limitação, danos por perda de lucros, dados ou outras perdas intangíveis, mesmo se tivermos sido avisados da possibilidade de tais danos.`
    },
    {
      title: '7. Links para Sites de Terceiros',
      content: `Nosso site pode conter links para sites de terceiros que não são de nossa propriedade ou controle. Não temos controle sobre, e não assumimos nenhuma responsabilidade pelo conteúdo, políticas de privacidade ou práticas de quaisquer sites de terceiros. Ao usar nosso site, você nos isenta de qualquer responsabilidade decorrente do uso de sites de terceiros.`
    },
    {
      title: '8. Modificações dos Termos',
      content: `Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. Notificaremos sobre alterações significativas publicando os novos Termos neste site. Seu uso continuado do site após a publicação de quaisquer alterações constitui aceitação dessas alterações.`
    },
    {
      title: '9. Rescisão',
      content: `Podemos encerrar ou suspender seu acesso ao nosso site imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar os Termos. Todas as disposições dos Termos que, por sua natureza, devem sobreviver à rescisão, sobreviverão à rescisão.`
    },
    {
      title: '10. Lei Aplicável',
      content: `Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar suas disposições sobre conflitos de leis. Qualquer disputa relacionada a estes Termos será resolvida nos tribunais competentes do Brasil.`
    },
    {
      title: '11. Contato',
      content: `Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através dos canais disponíveis em nosso site ou diretamente com nosso corretor responsável Jenisson Luckwü (CRECI 11639).`
    }
  ];
}

