using CorretoraJenissonLuckwuAPI.Models.DTOs;
using CorretoraJenissonLuckwuAPI.Models.Entities;
using CorretoraJenissonLuckwuAPI.Repository;
using Microsoft.EntityFrameworkCore;

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
            return mensagem != null ? MapToDTO(mensagem) : null;
        }

        public async Task<List<MensagemDTO>> GetByUsuarioId(int usuarioId)
        {
            var mensagens = await _repository.GetByUsuarioIdAsync(usuarioId);
            return mensagens.Select(MapToDTO).ToList();
        }

        public async Task<List<MensagemDTO>> GetAll()
        {
            var mensagens = await _repository.GetAllAsync();
            return mensagens.Select(MapToDTO).ToList();
        }

        public async Task<List<MensagemDTO>> GetNaoLidas()
        {
            var mensagens = await _repository.GetNaoLidasAsync();
            return mensagens.Select(MapToDTO).ToList();
        }

        public async Task<int> GetCountNaoLidas()
        {
            return await _repository.GetCountNaoLidasAsync();
        }

        public async Task<MensagemDTO> Add(Mensagem mensagem)
        {
            var result = await _repository.AddAsync(mensagem);
            return MapToDTO(result);
        }

        public async Task<bool> MarkAsRead(int id)
        {
            return await _repository.MarkAsReadAsync(id);
        }

        private MensagemDTO MapToDTO(Mensagem mensagem)
        {
            return new MensagemDTO
            {
                Id = mensagem.Id,
                Usuario_Id = mensagem.Usuario_Id,
                Usuario_Email = mensagem.Usuario?.Email,
                Administrador_Id = mensagem.Administrador_Id,
                Administrador_Nome = mensagem.Administrador?.Nome,
                Conteudo = mensagem.Conteudo,
                Remetente_Tipo = mensagem.Remetente_Tipo,
                Lida = mensagem.Lida,
                Created_At = mensagem.Created_At
            };
        }
    }
}

