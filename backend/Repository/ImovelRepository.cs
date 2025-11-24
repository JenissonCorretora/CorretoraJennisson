using CorretoraJenissonLuckwuAPI.EFModel.Configurations;
using CorretoraJenissonLuckwuAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace CorretoraJenissonLuckwuAPI.Repository
{
    public class ImovelRepository
    {
        private readonly CorretoraJenissonLuckwuDb _context;

        public ImovelRepository(CorretoraJenissonLuckwuDb context)
        {
            _context = context;
        }

        public async Task<Imovel?> GetByIdAsync(int id)
        {
            return await _context.Imoveis
                .Include(i => i.Imagens)
                .Include(i => i.Favoritos)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task<List<Imovel>> GetAllAsync()
        {
            return await _context.Imoveis
                .Include(i => i.Imagens)
                .OrderByDescending(i => i.Created_at)
                .ToListAsync();
        }

        public async Task<Imovel?> AddAsync(Imovel imovel)
        {
            // Garante que novos imóveis sempre sejam criados como ativos
            if (!imovel.Ativo)
            {
                imovel.Ativo = true;
            }
            await _context.Imoveis.AddAsync(imovel);
            await _context.SaveChangesAsync();
            return imovel;
        }

        public async Task<Imovel?> UpdateAsync(int id, Imovel imovel)
        {
            var imovelBanco = await _context.Imoveis.FindAsync(id);

            if (imovelBanco == null)
                return null;

            imovelBanco.Titulo = imovel.Titulo;
            imovelBanco.Descricao = imovel.Descricao;
            imovelBanco.Endereco = imovel.Endereco;
            imovelBanco.Cidade = imovel.Cidade;
            imovelBanco.Estado = imovel.Estado;
            imovelBanco.Preco = imovel.Preco;
            imovelBanco.Status = imovel.Status;
            imovelBanco.TipoImovel = imovel.TipoImovel;
            imovelBanco.Ativo = imovel.Ativo;
            imovelBanco.Updated_at = DateTime.UtcNow;

            _context.Imoveis.Update(imovelBanco);
            await _context.SaveChangesAsync();

            return imovelBanco;
        }

        public async Task<Imovel?> DeleteAsync(int id)
        {
            var imovelBanco = await _context.Imoveis.FindAsync(id);

            if (imovelBanco == null)
                return null;

            _context.Imoveis.Remove(imovelBanco);
            await _context.SaveChangesAsync();

            return imovelBanco;
        }

        public async Task<List<Imovel>> GetByCidadeAsync(string cidade)
        {
            return await _context.Imoveis
                .Include(i => i.Imagens)
                .Where(i => i.Cidade.Contains(cidade))
                .OrderByDescending(i => i.Created_at)
                .ToListAsync();
        }

        public async Task<List<Imovel>> GetByTipoAsync(string tipo)
        {
            var normalizedTipo = tipo?.Trim().ToLower() ?? string.Empty;

            return await _context.Imoveis
                .Include(i => i.Imagens)
                .Where(i => i.TipoImovel != null && i.TipoImovel.ToLower() == normalizedTipo)
                .OrderByDescending(i => i.Created_at)
                .ToListAsync();
        }

        public async Task<List<Imovel>> GetByStatusAsync(StatusImovel status)
        {
            return await _context.Imoveis
                .Include(i => i.Imagens)
                .Where(i => i.Status == status)
                .OrderByDescending(i => i.Created_at)
                .ToListAsync();
        }

        public async Task<List<Imovel>> GetByPrecoRangeAsync(decimal precoMin, decimal precoMax)
        {
            return await _context.Imoveis
                .Include(i => i.Imagens)
                .Where(i => i.Preco >= precoMin && i.Preco <= precoMax)
                .OrderByDescending(i => i.Created_at)
                .ToListAsync();
        }

        public async Task<Imovel?> UpdateAtivoAsync(int id, bool ativo)
        {
            var imovelBanco = await _context.Imoveis
                .Include(i => i.Imagens)
                .Include(i => i.Favoritos)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (imovelBanco == null)
            {
                return null;
            }

            imovelBanco.Ativo = ativo;
            imovelBanco.Updated_at = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return imovelBanco;
        }
    }
}

