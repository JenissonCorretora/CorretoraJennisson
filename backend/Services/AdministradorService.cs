using CorretoraJenissonLuckwuAPI.Models.Entities;
using CorretoraJenissonLuckwuAPI.Repository;

namespace CorretoraJenissonLuckwuAPI.Services
{
    public class AdministradorService
    {
        private AdministradorRepository _repository;
        private PasswordService _passwordService;
        private readonly UsuarioRepository _usuarioRepository;

        public AdministradorService(
            AdministradorRepository repository, 
            PasswordService passwordService,
            UsuarioRepository usuarioRepository)
        {
            _repository = repository;
            _passwordService = passwordService;
            _usuarioRepository = usuarioRepository;
        }

        public async Task<Administrador?> GetById(int id)
        {
            return await _repository.GetByIdAsync(id);
        }
        public async Task<Administrador?> Add(Administrador administrador)
        {
            // VALIDAÇÃO: Verifica se o email já existe em Administradores ou Usuarios
            if (!string.IsNullOrWhiteSpace(administrador.Email))
            {
                var normalizedEmail = administrador.Email.Trim().ToLowerInvariant();
                
                // Verifica se já existe em Administradores
                var administradorExistente = await _repository.GetByEmailAsync(normalizedEmail);
                if (administradorExistente != null)
                {
                    throw new InvalidOperationException($"O email '{administrador.Email}' já está cadastrado como administrador.");
                }

                // Verifica se já existe em Usuarios
                var usuarioExistente = await _usuarioRepository.GetByEmailAsync(normalizedEmail);
                if (usuarioExistente != null)
                {
                    throw new InvalidOperationException($"O email '{administrador.Email}' já está cadastrado como usuário.");
                }
            }

            // Hash da senha antes de salvar
            administrador.Senha = _passwordService.HashPassword(administrador.Senha);
            return await _repository.AddAsync(administrador);
        }
        public async Task<Administrador?> GetByNome(string nome)
        {
            return await _repository.GetByNomeAsync(nome);
        }
        public async Task<Administrador?> GetByEmail(string email)
        {
            return await _repository.GetByEmailAsync(email);
        }
        public async Task<Administrador?> Post(int id, Administrador administrador) 
        {
            // Se a senha foi fornecida, fazer hash antes de atualizar
            if (!string.IsNullOrEmpty(administrador.Senha))
            {
                administrador.Senha = _passwordService.HashPassword(administrador.Senha);
            }
            return await _repository.PostAsync(id, administrador);
        }
        public async Task<Administrador?> Delete(int id) 
        {
            return await _repository.DeleteAsync(id);
        }
    }
}
