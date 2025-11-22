using CorretoraJenissonLuckwuAPI.Models.DTOs;
using CorretoraJenissonLuckwuAPI.Models.Entities;
using CorretoraJenissonLuckwuAPI.Repository;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace CorretoraJenissonLuckwuAPI.Services
{
    public class MensagemService
    {
        private readonly MensagemRepository _repository;

        public MensagemService(MensagemRepository repository)
        {
            _repository = repository;
        }

        public async Task<MensagemDTO?> GetById(int id)
        {
            var mensagem = await _repository.GetByIdAsync(id);
            if (mensagem == null) return null;

            // Para GetById, precisamos buscar todas as mensagens do mesmo usuário para extrair o nome
            var todasMensagensUsuario = await _repository.GetByUsuarioIdAsync(mensagem.Usuario_Id);
            return MapToDTO(mensagem, todasMensagensUsuario);
        }

        public async Task<List<MensagemDTO>> GetByUsuarioId(int usuarioId)
        {
            var mensagens = await _repository.GetByUsuarioIdAsync(usuarioId);
            return mensagens.Select(m => MapToDTO(m, mensagens)).ToList();
        }

        public async Task<List<MensagemDTO>> GetAll()
        {
            var mensagens = await _repository.GetAllAsync();
            // Agrupa mensagens por usuário para extrair o nome corretamente
            var mensagensPorUsuario = mensagens.GroupBy(m => m.Usuario_Id);
            var resultado = new List<MensagemDTO>();

            foreach (var grupo in mensagensPorUsuario)
            {
                var mensagensDoUsuario = grupo.ToList();
                foreach (var mensagem in mensagensDoUsuario)
                {
                    resultado.Add(MapToDTO(mensagem, mensagensDoUsuario));
                }
            }

            return resultado;
        }

        public async Task<List<MensagemDTO>> GetNaoLidas()
        {
            var mensagens = await _repository.GetNaoLidasAsync();
            // Agrupa mensagens por usuário para extrair o nome corretamente
            var mensagensPorUsuario = mensagens.GroupBy(m => m.Usuario_Id);
            var resultado = new List<MensagemDTO>();

            foreach (var grupo in mensagensPorUsuario)
            {
                var mensagensDoUsuario = grupo.ToList();
                foreach (var mensagem in mensagensDoUsuario)
                {
                    resultado.Add(MapToDTO(mensagem, mensagensDoUsuario));
                }
            }

            return resultado;
        }

        public async Task<int> GetCountNaoLidas()
        {
            return await _repository.GetCountNaoLidasAsync();
        }

        public async Task<MensagemDTO> Add(Mensagem mensagem)
        {
            var result = await _repository.AddAsync(mensagem);
            // Busca todas as mensagens do usuário para extrair o nome
            var todasMensagensUsuario = await _repository.GetByUsuarioIdAsync(mensagem.Usuario_Id);
            return MapToDTO(result, todasMensagensUsuario);
        }

        public async Task<bool> MarkAsRead(int id)
        {
            return await _repository.MarkAsReadAsync(id);
        }

        /// <summary>
        /// Mapeia uma entidade Mensagem para DTO, incluindo o nome do usuário
        /// IMPORTANTE: Funciona EXATAMENTE como Administrador.Nome - usa o campo direto da entidade primeiro
        /// </summary>
        private MensagemDTO MapToDTO(Mensagem mensagem, List<Mensagem>? todasMensagensUsuario = null)
        {
            string? usuarioNome = null;

            // PRIORIDADE 1: Usa o campo Nome da entidade Usuario (igual ao Administrador.Nome funciona)
            // Isso é a mesma lógica que funciona para Administrador.Nome na linha 137
            if (mensagem.Usuario != null && !string.IsNullOrWhiteSpace(mensagem.Usuario.Nome))
            {
                usuarioNome = mensagem.Usuario.Nome.Trim();
            }

            // PRIORIDADE 2: Se não tem Nome na entidade, tenta extrair da primeira mensagem
            if (string.IsNullOrWhiteSpace(usuarioNome))
            {
                if (todasMensagensUsuario != null && todasMensagensUsuario.Any())
                {
                    // Busca o nome na primeira mensagem do tipo Usuario que contenha "Contato:"
                    var primeiraMensagemComNome = todasMensagensUsuario
                        .Where(m => m.Remetente_Tipo == RemetenteTipo.Usuario)
                        .OrderBy(m => m.Created_At)
                        .FirstOrDefault(m => !string.IsNullOrEmpty(m.Conteudo) && 
                                             m.Conteudo.Contains("Contato:", StringComparison.OrdinalIgnoreCase));

                    if (primeiraMensagemComNome != null)
                    {
                        usuarioNome = ExtrairNomeDaMensagem(primeiraMensagemComNome.Conteudo);
                    }

                    // Se não encontrou na primeira mensagem, tenta extrair da mensagem atual
                    if (string.IsNullOrWhiteSpace(usuarioNome) && mensagem.Remetente_Tipo == RemetenteTipo.Usuario)
                    {
                        usuarioNome = ExtrairNomeDaMensagem(mensagem.Conteudo);
                    }
                }
                else if (mensagem.Remetente_Tipo == RemetenteTipo.Usuario)
                {
                    // Tenta extrair da própria mensagem se não tiver acesso às outras
                    usuarioNome = ExtrairNomeDaMensagem(mensagem.Conteudo);
                }
            }

            // PRIORIDADE 3: Fallback - usa o email como nome se ainda não encontrou
            if (string.IsNullOrWhiteSpace(usuarioNome) && !string.IsNullOrEmpty(mensagem.Usuario?.Email))
            {
                var emailParts = mensagem.Usuario.Email.Split('@');
                if (emailParts.Length > 0 && !string.IsNullOrWhiteSpace(emailParts[0]))
                {
                    usuarioNome = CapitalizeFirst(emailParts[0].Trim());
                }
            }

            return new MensagemDTO
            {
                Id = mensagem.Id,
                Usuario_Id = mensagem.Usuario_Id,
                Usuario_Email = mensagem.Usuario?.Email,
                Usuario_Nome = usuarioNome, // Agora usa Usuario.Nome primeiro, igual Administrador.Nome
                Administrador_Id = mensagem.Administrador_Id,
                Administrador_Nome = mensagem.Administrador?.Nome, // Isso funciona porque usa o campo direto
                Conteudo = mensagem.Conteudo,
                Remetente_Tipo = mensagem.Remetente_Tipo,
                Lida = mensagem.Lida,
                Created_At = mensagem.Created_At
            };
        }

        /// <summary>
        /// Extrai o nome do usuário da mensagem procurando por "Contato: [nome]"
        /// </summary>
        private string? ExtrairNomeDaMensagem(string conteudo)
        {
            if (string.IsNullOrWhiteSpace(conteudo))
                return null;

            // Procura por "Contato: [nome]" na mensagem
            var match = Regex.Match(conteudo, @"Contato:\s*(.+?)(?:\n|$)", RegexOptions.IgnoreCase);
            if (match.Success && match.Groups.Count > 1)
            {
                var nome = match.Groups[1].Value.Trim();
                return CapitalizeFirst(nome);
            }

            return null;
        }

        /// <summary>
        /// Capitaliza a primeira letra de uma string
        /// </summary>
        private string CapitalizeFirst(string texto)
        {
            if (string.IsNullOrWhiteSpace(texto))
                return string.Empty;

            return char.ToUpper(texto[0]) + texto.Substring(1).ToLower();
        }
    }
}

