using CorretoraJenissonLuckwuAPI.EFModel.Configurations;
using CorretoraJenissonLuckwuAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace CorretoraJenissonLuckwuAPI.Repository
{
    public class MensagemRepository
    {
        private readonly CorretoraJenissonLuckwuDb _context;

        public MensagemRepository(CorretoraJenissonLuckwuDb context)
        {
            _context = context;
        }

        public async Task<Mensagem?> GetByIdAsync(int id)
        {
            return await _context.Mensagens
                .Include(m => m.Usuario)
                .Include(m => m.Administrador)
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<List<Mensagem>> GetByUsuarioIdAsync(int usuarioId)
        {
            return await _context.Mensagens
                .Include(m => m.Usuario)
                .Include(m => m.Administrador)
                .Where(m => m.Usuario_Id == usuarioId)
                .OrderByDescending(m => m.Created_At)
                .ToListAsync();
        }

        public async Task<List<Mensagem>> GetAllAsync()
        {
            return await _context.Mensagens
                .Include(m => m.Usuario)
                .Include(m => m.Administrador)
                .OrderByDescending(m => m.Created_At)
                .ToListAsync();
        }

        public async Task<List<Mensagem>> GetNaoLidasAsync()
        {
            return await _context.Mensagens
                .Include(m => m.Usuario)
                .Include(m => m.Administrador)
                .Where(m => !m.Lida && m.Remetente_Tipo == RemetenteTipo.Usuario)
                .OrderByDescending(m => m.Created_At)
                .ToListAsync();
        }

        public async Task<int> GetCountNaoLidasAsync()
        {
            return await _context.Mensagens
                .CountAsync(m => !m.Lida && m.Remetente_Tipo == RemetenteTipo.Usuario);
        }

        public async Task<Mensagem> AddAsync(Mensagem mensagem)
        {
            await _context.Mensagens.AddAsync(mensagem);
            await _context.SaveChangesAsync();
            return mensagem;
        }

        public async Task<Mensagem?> UpdateAsync(Mensagem mensagem)
        {
            var existing = await GetByIdAsync(mensagem.Id);
            if (existing == null) return null;

            _context.Entry(existing).CurrentValues.SetValues(mensagem);
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> MarkAsReadAsync(int id)
        {
            var mensagem = await GetByIdAsync(id);
            if (mensagem == null) return false;

            mensagem.Lida = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

