using CorretoraJenissonLuckwuAPI.EFModel.Configurations;
using CorretoraJenissonLuckwuAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace CorretoraJenissonLuckwuAPI.Repository
{
    public class UsuarioRepository
    {
        private readonly CorretoraJenissonLuckwuDb _context;

        public UsuarioRepository(CorretoraJenissonLuckwuDb context)
        {
            _context = context;
        }

        public async Task<Usuario?> GetByIdAsync(int id)
        {
            return await _context.Usuarios
                .Include(u => u.Favoritos)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<List<Usuario>> GetAllAsync()
        {
            return await _context.Usuarios
                .OrderByDescending(u => u.Created_at)
                .ToListAsync();
        }

        public async Task<Usuario?> AddAsync(Usuario usuario)
        {
            await _context.Usuarios.AddAsync(usuario);
            await _context.SaveChangesAsync();
            return usuario;
        }

        public async Task<Usuario?> UpdateAsync(int id, Usuario usuario)
        {
            var usuarioBanco = await _context.Usuarios.FindAsync(id);

            if (usuarioBanco == null)
                return null;

            // Atualiza todos os campos, incluindo o campo Nome
            usuarioBanco.Nome = usuario.Nome;
            usuarioBanco.Email = usuario.Email;
            usuarioBanco.Senha = usuario.Senha;
            usuarioBanco.Telefone = usuario.Telefone;
            usuarioBanco.Stream_user_id = usuario.Stream_user_id;
            usuarioBanco.Updated_at = DateTime.UtcNow;

            _context.Usuarios.Update(usuarioBanco);
            await _context.SaveChangesAsync();

            return usuarioBanco;
        }

        public async Task<Usuario?> DeleteAsync(int id)
        {
            var usuarioBanco = await _context.Usuarios.FindAsync(id);

            if (usuarioBanco == null)
                return null;

            _context.Usuarios.Remove(usuarioBanco);
            await _context.SaveChangesAsync();

            return usuarioBanco;
        }

        public async Task<Usuario?> GetByEmailAsync(string email)
        {
            // Comparação case-insensitive para email
            return await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<Usuario?> GetByStreamUserIdAsync(string streamUserId)
        {
            return await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Stream_user_id == streamUserId);
        }
    }
}

