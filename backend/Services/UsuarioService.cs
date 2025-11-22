using CorretoraJenissonLuckwuAPI.Models.Entities;
using CorretoraJenissonLuckwuAPI.Repository;

namespace CorretoraJenissonLuckwuAPI.Services
{
    public class UsuarioService
    {
        private readonly UsuarioRepository _repository;
        private readonly PasswordService _passwordService;
        private readonly AdministradorRepository _administradorRepository;

        public UsuarioService(
            UsuarioRepository repository, 
            PasswordService passwordService,
            AdministradorRepository administradorRepository)
        {
            _repository = repository;
            _passwordService = passwordService;
            _administradorRepository = administradorRepository;
        }

        public async Task<Usuario?> GetById(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<List<Usuario>> GetAll()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Usuario?> Add(Usuario usuario)
        {
            // VALIDAÇÃO: Verifica se o email já existe em Usuarios ou Administradores
            if (!string.IsNullOrWhiteSpace(usuario.Email))
            {
                var normalizedEmail = usuario.Email.Trim().ToLowerInvariant();
                
                // Verifica se já existe em Usuarios
                var usuarioExistente = await _repository.GetByEmailAsync(normalizedEmail);
                if (usuarioExistente != null)
                {
                    throw new InvalidOperationException($"O email '{usuario.Email}' já está cadastrado como usuário.");
                }

                // Verifica se já existe em Administradores
                var administradorExistente = await _administradorRepository.GetByEmailAsync(normalizedEmail);
                if (administradorExistente != null)
                {
                    throw new InvalidOperationException($"O email '{usuario.Email}' já está cadastrado como administrador.");
                }
            }

            // Hash da senha antes de salvar
            if (!string.IsNullOrEmpty(usuario.Senha))
            {
                usuario.Senha = _passwordService.HashPassword(usuario.Senha);
            }
            return await _repository.AddAsync(usuario);
        }

        public async Task<Usuario?> Update(int id, Usuario usuario)
        {
            // Se a senha foi fornecida, fazer hash antes de atualizar
            if (!string.IsNullOrEmpty(usuario.Senha))
            {
                usuario.Senha = _passwordService.HashPassword(usuario.Senha);
            }
            return await _repository.UpdateAsync(id, usuario);
        }

        public async Task<Usuario?> Delete(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        public async Task<Usuario?> GetByEmail(string email)
        {
            return await _repository.GetByEmailAsync(email);
        }

        public async Task<Usuario?> GetByStreamUserId(string streamUserId)
        {
            return await _repository.GetByStreamUserIdAsync(streamUserId);
        }
    }
}

