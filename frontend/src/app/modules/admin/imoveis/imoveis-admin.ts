import { Component, signal, computed, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of, switchMap, map, catchError, finalize } from 'rxjs';
import { ImovelService, Imovel, StatusImovel, CreateImovelRequest, DEFAULT_TIPOS_IMOVEL } from '../../../services/imovel.service';
import { ImagemImovelService } from '../../../services/imagem-imovel.service';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-imoveis-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './imoveis-admin.html',
  styleUrls: ['./imoveis-admin.scss']
})
export class ImoveisAdmin implements OnInit {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  // Estados
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showForm = signal(false);
  editingImovel = signal<Imovel | null>(null);
  uploadingImages = signal(false);

  // Formulário
  formData: Partial<CreateImovelRequest> = {
    titulo: '',
    tipoImovel: '',
    estado: 'PB',
    cidade: 'João Pessoa',
    endereco: '',
    status: StatusImovel.Disponivel,
    descricao: '',
    ativo: true
  };

  imagensSelecionadas = signal<File[]>([]);
  imagensPreview = signal<string[]>([]);
  imagensExistentes = signal<string[]>([]); // URLs das imagens já salvas

  // Filtros e busca
  searchTerm = signal('');
  tipoFiltro = signal<string>('');
  statusFiltro = signal<StatusImovel | ''>('');

  // Dados carregados da API
  imoveis = signal<Imovel[]>([]);

  // Opções
  tipos = signal<string[]>([...DEFAULT_TIPOS_IMOVEL]);
  statusOptions = Object.values(StatusImovel);
  estados = ['PB', 'PE', 'RN', 'CE', 'AL', 'SE', 'BA'];
  cidades = signal<string[]>([]);

  // Estado de autenticação
  isAdmin = computed(() => this.authService.isAdmin());

  constructor(
    private imovelService: ImovelService,
    private imagemImovelService: ImagemImovelService,
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    // Verifica se é admin
    if (!this.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }

    this.carregarImoveis();
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
        this.atualizarTipos(imoveis);
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

  private atualizarTipos(imoveis: Imovel[]): void {
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

  private titleCase(value: string): string {
    if (!value) return '';
    return value
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private tipDefault(): string {
    return '';
  }

  /**
   * Imóveis filtrados
   */
  imoveisFiltrados = computed(() => {
    let resultado = [...this.imoveis()];

    const busca = this.searchTerm().toLowerCase();
    if (busca) {
      resultado = resultado.filter(imovel =>
        imovel.titulo?.toLowerCase().includes(busca) ||
        imovel.endereco?.toLowerCase().includes(busca) ||
        imovel.cidade?.toLowerCase().includes(busca)
      );
    }

    const filtroTipo = this.tipoFiltro().toLowerCase();
    if (filtroTipo) {
      resultado = resultado.filter(imovel =>
        (imovel.tipoImovel || '').toLowerCase() === filtroTipo
      );
    }

    if (this.statusFiltro()) {
      resultado = resultado.filter(imovel => imovel.status === this.statusFiltro());
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
   * Obtém URL da primeira imagem do imóvel
   */
  getImagemUrl(imovel: Imovel): string {
    if (imovel.imagens && imovel.imagens.length > 0) {
      return imovel.imagens[0].url;
    }
    return '/images/placeholder-imovel.jpg';
  }

  /**
   * Abre formulário para novo imóvel
   */
  novoImovel(): void {
    this.editingImovel.set(null);
    this.formData = {
      titulo: '',
      tipoImovel: '',
      estado: 'PB',
      cidade: 'João Pessoa',
      endereco: '',
      preco: undefined,
      status: StatusImovel.Disponivel,
      descricao: '',
      ativo: true
    };
    this.imagensSelecionadas.set([]);
    this.imagensPreview.set([]);
    this.imagensExistentes.set([]);
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
    this.formData = {
      titulo: imovel.titulo,
      tipoImovel: imovel.tipoImovel,
      estado: imovel.estado,
      cidade: imovel.cidade,
      endereco: imovel.endereco,
      preco: imovel.preco,
      status: imovel.status,
      descricao: imovel.descricao,
      ativo: imovel.ativo !== false
    };
    this.imagensSelecionadas.set([]);
    this.imagensPreview.set([]);

    // Carrega imagens existentes do imóvel
    if (imovel.imagens && imovel.imagens.length > 0) {
      this.imagensExistentes.set(imovel.imagens.map(img => img.url));
    } else {
      this.imagensExistentes.set([]);
    }

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
    this.imagensExistentes.set([]);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  /**
   * Salva imóvel (criar ou editar)
   */
  salvarImovel(): void {
    const tipoNormalizado = this.titleCase((this.formData.tipoImovel || '').trim());
    this.formData.tipoImovel = tipoNormalizado;

    // Validações
    if (!this.formData.titulo || !tipoNormalizado || !this.formData.cidade ||
        !this.formData.endereco || !this.formData.preco || !this.formData.descricao ||
        !this.formData.estado || !this.formData.status) {
      this.errorMessage.set('Por favor, preencha todos os campos obrigatórios.');
      this.scrollToTop();
      return;
    }

    if (this.formData.preco! <= 0) {
      this.errorMessage.set('O preço deve ser maior que zero.');
      this.scrollToTop();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const imovelData: CreateImovelRequest = {
      titulo: this.formData.titulo!,
      tipoImovel: tipoNormalizado,
      estado: this.formData.estado!,
      cidade: this.formData.cidade!,
      endereco: this.formData.endereco!,
      preco: this.formData.preco!,
      status: this.formData.status!,
      descricao: this.formData.descricao!,
      ativo: this.formData.ativo ?? true
    };

    const editing = this.editingImovel();
    const operacao = editing ? 'atualizar' : 'criar';

    const salvar$ = editing
      ? this.imovelService.update(editing.id, imovelData)
      : this.imovelService.create(imovelData);

    salvar$
      .pipe(
        switchMap((imovelSalvo) =>
          this.processarUploads(imovelSalvo.id).pipe(
            map(uploadComAviso => ({ imovel: imovelSalvo, uploadComAviso }))
          )
        ),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: ({ uploadComAviso }) => {
          this.cancelar();
          this.carregarImoveis();

          const mensagemBase = editing
            ? 'Imóvel atualizado com sucesso!'
            : 'Imóvel criado com sucesso!';

          const mensagemFinal = uploadComAviso
            ? `${mensagemBase} Algumas imagens não foram enviadas.`
            : mensagemBase;

          this.successMessage.set(mensagemFinal);
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (error) => {
          console.error('Erro ao salvar imóvel:', error);
          this.errorMessage.set(this.getErroMensagemOperacao(operacao, error));
          this.scrollToTop();
        }
      });
  }

  /**
   * Faz upload das novas imagens (quando houver) e retorna se houve aviso
   */
  private processarUploads(imovelId: number) {
    const arquivos = this.imagensSelecionadas();

    if (arquivos.length === 0) {
      this.imagensSelecionadas.set([]);
      this.imagensPreview.set([]);
      return of(false);
    }

    this.uploadingImages.set(true);
    const uploads = arquivos.map(file => this.imagemImovelService.upload(imovelId, file));

    return forkJoin(uploads).pipe(
      map(() => false),
      catchError((error) => {
        console.error('Erro ao fazer upload de imagens:', error);
        this.errorMessage.set('Imóvel salvo, mas algumas imagens não foram enviadas.');
        return of(true);
      }),
      finalize(() => {
        this.uploadingImages.set(false);
        this.imagensSelecionadas.set([]);
        this.imagensPreview.set([]);
      })
    );
  }

  /**
   * Deleta imóvel
   */
  deletarImovel(imovel: Imovel): void {
    this.alertService.confirmDanger(
      'Excluir Imóvel',
      `Tem certeza que deseja excluir o imóvel "${imovel.titulo}"? Esta ação não pode ser desfeita.`,
      'Sim, excluir',
      'Cancelar'
    ).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.loading.set(true);

    this.imovelService.delete(imovel.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Imóvel excluído com sucesso!');
        this.carregarImoveis();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Erro ao deletar imóvel:', error);
        this.loading.set(false);

        if (error?.status === 404) {
          this.successMessage.set('Imóvel já havia sido removido. Lista atualizada.');
          this.carregarImoveis();
          setTimeout(() => this.successMessage.set(''), 3000);
          return;
        }

        this.errorMessage.set('Erro ao excluir imóvel. Tente novamente.');
      }
    });
    });
  }

  toggleAtivo(imovel: Imovel): void {
    const estaAtivo = imovel.ativo !== false;
    const proximoEstado = !estaAtivo;
    const titulo = proximoEstado ? 'Habilitar Imóvel' : 'Desabilitar Imóvel';
    const mensagem = proximoEstado
      ? `Deseja habilitar o imóvel "${imovel.titulo}"? Ele ficará visível para os clientes.`
      : `Deseja desabilitar o imóvel "${imovel.titulo}"? Ele deixará de aparecer para os clientes.`;

    this.alertService.confirm(
      titulo,
      mensagem,
      proximoEstado ? 'Sim, habilitar' : 'Sim, desabilitar',
      'Cancelar',
      'question'
    ).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.loading.set(true);

      this.imovelService.updateAtivo(imovel.id, proximoEstado).pipe(
        // Após atualizar, recarrega o imóvel completo do backend para garantir que todas as propriedades estejam atualizadas
        switchMap(() => this.imovelService.getById(imovel.id)),
        finalize(() => this.loading.set(false))
      ).subscribe({
        next: (imovelAtualizado) => {
          // Atualiza o imóvel no array com os dados completos (incluindo imagens)
          const atualizados = this.imoveis().map(item =>
            item.id === imovelAtualizado.id ? imovelAtualizado : item
          );
          this.imoveis.set(atualizados);

          // Se estiver editando este imóvel, atualiza também o estado do formulário
          const editing = this.editingImovel();
          if (editing && editing.id === imovelAtualizado.id) {
            this.editingImovel.set(imovelAtualizado);
            // Atualiza as imagens existentes no formulário
            if (imovelAtualizado.imagens && imovelAtualizado.imagens.length > 0) {
              this.imagensExistentes.set(imovelAtualizado.imagens.map(img => img.url));
            } else {
              this.imagensExistentes.set([]);
            }
          }

          this.successMessage.set(proximoEstado
            ? 'Imóvel habilitado com sucesso!'
            : 'Imóvel desabilitado com sucesso!');
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (error) => {
          console.error('Erro ao atualizar visibilidade do imóvel:', error);
          this.errorMessage.set('Não foi possível alterar a visibilidade do imóvel. Tente novamente.');
          setTimeout(() => this.errorMessage.set(''), 4000);
        }
      });
    });
  }

  /**
   * Deleta uma imagem específica
   */
  deletarImagem(imovelId: number, imagemId: number, index: number): void {
    this.alertService.confirmDanger(
      'Excluir Imagem',
      'Tem certeza que deseja excluir esta imagem?',
      'Sim, excluir',
      'Cancelar'
    ).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.imagemImovelService.delete(imagemId).subscribe({
      next: () => {
        // Remove da lista de imagens existentes
        const imagens = [...this.imagensExistentes()];
        imagens.splice(index, 1);
        this.imagensExistentes.set(imagens);

        // Recarrega os imóveis para atualizar a lista
        this.carregarImoveis();
        this.successMessage.set('Imagem excluída com sucesso!');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Erro ao deletar imagem:', error);
        if (error?.status === 404) {
          this.successMessage.set('Imagem já havia sido removida. Lista atualizada.');
          this.carregarImoveis();
          setTimeout(() => this.successMessage.set(''), 3000);
          return;
        }

        if (error?.status === 200 || error?.statusText === 'OK') {
          // Tratamento para casos em que o backend retorna texto simples e o HttpClient interpreta como erro
          this.successMessage.set('Imagem excluída com sucesso!');
          this.carregarImoveis();
          setTimeout(() => this.successMessage.set(''), 3000);
          return;
        }

        this.errorMessage.set('Erro ao excluir imagem. Tente novamente.');
      }
    });
    });
  }

  private getErroMensagemOperacao(acao: string, error: any): string {
    if (error?.status === 0) {
      return 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.';
    }

    if (typeof error?.error === 'string') {
      return error.error;
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.status === 400) {
      return 'Dados inválidos. Verifique as informações e tente novamente.';
    }

    if (error?.status === 404) {
      return 'Imóvel não encontrado.';
    }

    return `Erro ao ${acao} imóvel. Tente novamente.`;
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

      // Limita a 10 imagens por vez
      const totalImagens = this.imagensSelecionadas().length + validFiles.length;
      if (totalImagens > 10) {
        this.errorMessage.set('Você pode adicionar no máximo 10 imagens por imóvel.');
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

      // Limpa o input para permitir selecionar o mesmo arquivo novamente
      input.value = '';
    }
  }

  /**
   * Remove imagem do preview (apenas novas, não salvas)
   */
  removerImagemPreview(index: number): void {
    const previews = [...this.imagensPreview()];
    previews.splice(index, 1);
    this.imagensPreview.set(previews);

    const files = [...this.imagensSelecionadas()];
    files.splice(index, 1);
    this.imagensSelecionadas.set(files);
  }

  /**
   * Obtém todas as imagens (existentes + previews)
   */
  todasImagens(): string[] {
    return [...this.imagensExistentes(), ...this.imagensPreview()];
  }

  /**
   * Verifica se pode deletar uma imagem existente
   */
  podeDeletarImagem(index: number): boolean {
    const imovel = this.editingImovel();
    return !!(imovel && imovel.imagens && imovel.imagens.length > index && imovel.imagens[index]);
  }

  /**
   * Obtém o ID da imagem no índice especificado
   */
  getImagemId(index: number): number | null {
    const imovel = this.editingImovel();
    if (imovel && imovel.imagens && imovel.imagens.length > index && imovel.imagens[index]) {
      return imovel.imagens[index].id;
    }
    return null;
  }
}
