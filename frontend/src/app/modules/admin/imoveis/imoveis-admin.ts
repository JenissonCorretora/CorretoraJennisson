import { Component, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Imovel {
  id: number;
  titulo: string;
  tipo: string;
  localizacao: string;
  bairro: string;
  cidade: string;
  preco: number;
  quartos?: number;
  banheiros?: number;
  area?: number;
  vagas?: number;
  imagens?: string[];
  descricao: string;
}

@Component({
  selector: 'app-imoveis-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './imoveis-admin.html',
  styleUrls: ['./imoveis-admin.scss']
})
export class ImoveisAdmin {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  // Estados
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showForm = signal(false);
  editingImovel = signal<Imovel | null>(null);

  // Formulário
  formData: Partial<Imovel> = {
    titulo: '',
    tipo: '',
    bairro: '',
    cidade: 'João Pessoa',
    preco: 0,
    quartos: undefined,
    banheiros: undefined,
    area: undefined,
    vagas: undefined,
    descricao: ''
  };

  imagensSelecionadas = signal<File[]>([]);
  imagensPreview = signal<string[]>([]);

  // Filtros e busca
  searchTerm = signal('');
  tipoFiltro = signal<string>('');

  // Dados (simulado - depois será substituído por API)
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
      imagens: []
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
      imagens: []
    }
  ]);

  tipos = ['Casa', 'Apartamento', 'Terreno', 'Sobrado', 'Kitnet', 'Studio'];
  cidades = ['João Pessoa', 'Cabedelo', 'Bayeux', 'Santa Rita'];
  bairros = ['Manaíra', 'Tambaú', 'Bessa', 'Cabo Branco', 'Jardim Oceania'];

  // Imóveis filtrados
  imoveisFiltrados = computed(() => {
    let resultado = [...this.imoveis()];

    const busca = this.searchTerm().toLowerCase();
    if (busca) {
      resultado = resultado.filter(imovel =>
        imovel.titulo.toLowerCase().includes(busca) ||
        imovel.bairro.toLowerCase().includes(busca) ||
        imovel.cidade.toLowerCase().includes(busca)
      );
    }

    if (this.tipoFiltro()) {
      resultado = resultado.filter(imovel => imovel.tipo === this.tipoFiltro());
    }

    return resultado;
  });

  /**
   * Formata preço
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
   * Abre formulário para novo imóvel
   */
  novoImovel(): void {
    this.editingImovel.set(null);
    this.formData = {
      titulo: '',
      tipo: '',
      bairro: '',
      cidade: 'João Pessoa',
      preco: 0,
      quartos: undefined,
      banheiros: undefined,
      area: undefined,
      vagas: undefined,
      descricao: ''
    };
    this.imagensSelecionadas.set([]);
    this.imagensPreview.set([]);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.showForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Abre formulário para editar imóvel
   */
  editarImovel(imovel: Imovel): void {
    this.editingImovel.set(imovel);
    this.formData = { ...imovel };
    this.imagensSelecionadas.set([]);
    this.imagensPreview.set(imovel.imagens || []);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.showForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Cancela edição/criação
   */
  cancelar(): void {
    this.showForm.set(false);
    this.editingImovel.set(null);
    this.formData = {};
    this.imagensSelecionadas.set([]);
    this.imagensPreview.set([]);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  /**
   * Salva imóvel (criar ou editar)
   */
  salvarImovel(): void {
    // Validações
    if (!this.formData.titulo || !this.formData.tipo || !this.formData.bairro || !this.formData.cidade || !this.formData.preco || !this.formData.descricao) {
      this.errorMessage.set('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (this.formData.preco! <= 0) {
      this.errorMessage.set('O preço deve ser maior que zero.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    // TODO: Implementar chamada à API
    setTimeout(() => {
      const imovelData: Imovel = {
        id: this.editingImovel()?.id || Date.now(),
        titulo: this.formData.titulo!,
        tipo: this.formData.tipo!,
        localizacao: this.formData.bairro!,
        bairro: this.formData.bairro!,
        cidade: this.formData.cidade!,
        preco: this.formData.preco!,
        quartos: this.formData.quartos,
        banheiros: this.formData.banheiros,
        area: this.formData.area,
        vagas: this.formData.vagas,
        descricao: this.formData.descricao!,
        imagens: this.imagensPreview()
      };

      if (this.editingImovel()) {
        // Editar
        const index = this.imoveis().findIndex(i => i.id === imovelData.id);
        if (index !== -1) {
          const updated = [...this.imoveis()];
          updated[index] = imovelData;
          this.imoveis.set(updated);
        }
        this.successMessage.set('Imóvel atualizado com sucesso!');
      } else {
        // Criar
        this.imoveis.set([...this.imoveis(), imovelData]);
        this.successMessage.set('Imóvel criado com sucesso!');
      }

      this.loading.set(false);
      this.cancelar();

      // Limpa mensagem após 3 segundos
      setTimeout(() => this.successMessage.set(''), 3000);
    }, 1500);
  }

  /**
   * Deleta imóvel
   */
  deletarImovel(imovel: Imovel): void {
    if (!confirm(`Tem certeza que deseja excluir o imóvel "${imovel.titulo}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    this.loading.set(true);

    // TODO: Implementar chamada à API
    setTimeout(() => {
      this.imoveis.set(this.imoveis().filter(i => i.id !== imovel.id));
      this.loading.set(false);
      this.successMessage.set('Imóvel excluído com sucesso!');
      setTimeout(() => this.successMessage.set(''), 3000);
    }, 1000);
  }

  /**
   * Abre seletor de arquivos
   */
  abrirSeletorImagens(): void {
    this.fileInput?.nativeElement.click();
  }

  /**
   * Seleciona imagens para upload
   */
  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      const validFiles = files.filter(file => file.type.startsWith('image/'));

      if (validFiles.length !== files.length) {
        this.errorMessage.set('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      // Adiciona às imagens selecionadas
      this.imagensSelecionadas.set([...this.imagensSelecionadas(), ...validFiles]);

      // Gera previews
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = e.target?.result as string;
          this.imagensPreview.set([...this.imagensPreview(), preview]);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  /**
   * Remove imagem do preview
   */
  removerImagem(index: number): void {
    const previews = [...this.imagensPreview()];
    previews.splice(index, 1);
    this.imagensPreview.set(previews);

    const files = [...this.imagensSelecionadas()];
    files.splice(index, 1);
    this.imagensSelecionadas.set(files);
  }

  /**
   * Formata número de telefone
   */
  formatarPrecoInput(): void {
    // Remove formatação para validação, mas mantém o valor numérico
    if (this.formData.preco) {
      this.formData.preco = Number(this.formData.preco.toString().replace(/\D/g, ''));
    }
  }
}

