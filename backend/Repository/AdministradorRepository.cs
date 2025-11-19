using CorretoraJenissonLuckwuAPI.EFModel.Configurations;
using CorretoraJenissonLuckwuAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace CorretoraJenissonLuckwuAPI.Repository
{
    public class AdministradorRepository
    {
        private readonly CorretoraJenissonLuckwuDb _context;

        public AdministradorRepository(CorretoraJenissonLuckwuDb context)
        {
            _context = context;
        }

        public async Task<Administrador?> GetByIdAsync(int id)
        {
            return await _context.Administradores.FindAsync(id);
        }
        public async Task<Administrador?> AddAsync(Administrador administrador)
        {
            await _context.Administradores.AddAsync(administrador);
            await _context.SaveChangesAsync();
            return administrador;
        }
        public async Task<Administrador?> GetByNomeAsync(string nome)
        {
            var AdministradoresBanco = await _context.Administradores.Where(x => x.Nome.Contains(nome)).FirstOrDefaultAsync();

            return AdministradoresBanco;
        }
        public async Task<Administrador?> GetByEmailAsync(string email)
        {
            // Comparação case-insensitive para email
            return await _context.Administradores
                .FirstOrDefaultAsync(a => a.Email.ToLower() == email.ToLower());
        }
        public async Task<Administrador?> PostAsync(int id, Administrador administrador) 
        {
            var administradorBanco = await _context.Administradores.FindAsync(id);

            if (administradorBanco == null)
                return null;

            administradorBanco.Nome = administrador.Nome;
            administradorBanco.Email = administrador.Email;
            administradorBanco.Telefone = administrador.Telefone;
            administradorBanco.Senha = administrador.Senha;
            administradorBanco.ID_PFPJ = administrador.ID_PFPJ;
            administradorBanco.Updated_at = DateTime.UtcNow;

            _context.Administradores.Update(administradorBanco);
            await _context.SaveChangesAsync();

            return administradorBanco;
        }
        public async Task<Administrador?> DeleteAsync(int id) 
        {
            var administradorBanco = await _context.Administradores.FindAsync(id);

            if (administradorBanco == null)
                return null;

             _context.Administradores.Remove(administradorBanco);
            await _context.SaveChangesAsync();

            return administradorBanco;
        }
    }
}
