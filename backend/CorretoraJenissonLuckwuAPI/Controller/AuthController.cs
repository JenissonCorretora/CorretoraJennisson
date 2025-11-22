using CorretoraJenissonLuckwuAPI.Models.DTOs;
using CorretoraJenissonLuckwuAPI.Repository;
using CorretoraJenissonLuckwuAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace CorretoraJenissonLuckwuAPI.Controller
{
  [ApiController]
  [Route("api/[controller]")]
  public class AuthController : ControllerBase
  {
    #region Variables
    private readonly AdministradorRepository _administradorRepository;
    private readonly UsuarioRepository _usuarioRepository;
    private readonly PasswordService _passwordService;
    private readonly AuthService _authService;
    private readonly IConfiguration _configuration;
    #endregion

    #region Constructors
    public AuthController(
        AdministradorRepository administradorRepository,
        UsuarioRepository usuarioRepository,
        PasswordService passwordService,
        AuthService authService,
        IConfiguration configuration)
    {
      _administradorRepository = administradorRepository;
      _usuarioRepository = usuarioRepository;
      _passwordService = passwordService;
      _authService = authService;
      _configuration = configuration;
    }
    #endregion

    #region Controllers
    [HttpPost("login-administrador")]
    public async Task<ActionResult<LoginResponse>> LoginAdministrador(LoginRequest request)
    {
      try
      {
        Console.WriteLine($"[LoginAdministrador] Tentativa de login com email: '{request.Email}'");

        // Tenta autenticar como root admin primeiro
        if (TryAuthenticateRootAdmin(request, out var rootResponse))
        {
          Console.WriteLine($"[LoginAdministrador] Login como Root Admin bem-sucedido");
          return Ok(rootResponse);
        }

        // Busca administrador no banco de dados
        var administrador = await _administradorRepository.GetByEmailAsync(request.Email);

        if (administrador == null)
        {
          Console.WriteLine($"[LoginAdministrador] Administrador não encontrado para email: '{request.Email}'");
          return Unauthorized("Email ou senha inválidos");
        }

        Console.WriteLine($"[LoginAdministrador] Administrador encontrado (ID: {administrador.Id}, Email no BD: '{administrador.Email}')");
        Console.WriteLine($"[LoginAdministrador] Senha recebida no request: {(string.IsNullOrEmpty(request.Senha) ? "VAZIA" : "PRESENTE")}");
        Console.WriteLine($"[LoginAdministrador] Hash da senha no banco: {(string.IsNullOrEmpty(administrador.Senha) ? "VAZIO" : $"PRESENTE ({administrador.Senha.Length} caracteres)")}");

        // Verifica a senha
        var isPasswordValid = _passwordService.VerifyPassword(request.Senha, administrador.Senha);
        Console.WriteLine($"[LoginAdministrador] Resultado da verificação de senha: {(isPasswordValid ? "VÁLIDA" : "INVÁLIDA")}");
        
        if (!isPasswordValid)
        {
          Console.WriteLine($"[LoginAdministrador] Senha inválida para administrador ID: {administrador.Id}");
          return Unauthorized("Email ou senha inválidos");
        }

        Console.WriteLine($"[LoginAdministrador] Login bem-sucedido para administrador ID: {administrador.Id}");
        return Ok(BuildLoginResponse(administrador.Id, administrador.Email, "Admin"));
      }
      catch (Exception ex)
      {
        // Log do erro para debug (em produção, usar um logger apropriado)
        Console.WriteLine($"[LoginAdministrador] ERRO: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
      }
    }

    [HttpPost("login-usuario")]
    public async Task<ActionResult<LoginResponse>> LoginUsuario(LoginRequest request)
    {
      try
      {
        Console.WriteLine($"[LoginUsuario] Tentativa de login com email: '{request.Email}'");

        var usuario = await _usuarioRepository.GetByEmailAsync(request.Email);

        if (usuario == null)
        {
          Console.WriteLine($"[LoginUsuario] Usuário não encontrado para email: '{request.Email}'");
          return Unauthorized("Email ou senha inválidos");
        }

        Console.WriteLine($"[LoginUsuario] Usuário encontrado (ID: {usuario.Id}, Email no BD: '{usuario.Email}')");

        if (!_passwordService.VerifyPassword(request.Senha, usuario.Senha))
        {
          Console.WriteLine($"[LoginUsuario] Senha inválida para usuário ID: {usuario.Id}");
          return Unauthorized("Email ou senha inválidos");
        }

        Console.WriteLine($"[LoginUsuario] Login bem-sucedido para usuário ID: {usuario.Id}");
        return Ok(BuildLoginResponse(usuario.Id, usuario.Email, "User"));
      }
      catch (Exception ex)
      {
        Console.WriteLine($"[LoginUsuario] ERRO: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
      }
    }
    [HttpPost("refresh-token")]
    public Task<ActionResult<LoginResponse>> RefreshToken(RefreshTokenRequest request)
    {
      return Task.FromResult<ActionResult<LoginResponse>>(BadRequest("Refresh token não implementado completamente. Use login novamente."));
    }

    /// <summary>
    /// Identifica o tipo de usuário (Admin ou User) baseado no email
    /// CORREÇÃO: Normaliza o email antes de buscar para evitar problemas de comparação
    /// </summary>
    [HttpGet("identify-user-type")]
    public async Task<ActionResult<UserTypeResponse>> IdentifyUserType([FromQuery] string email)
    {
      try
      {
        if (string.IsNullOrWhiteSpace(email))
        {
          return BadRequest("Email é obrigatório");
        }

        // Normaliza o email (remove espaços e converte para lowercase)
        var normalizedEmail = email.Trim().ToLowerInvariant();

        // Verifica se é root admin primeiro
        var rootSection = _configuration.GetSection("RootAdmin");
        var rootEnabled = rootSection.GetValue<bool>("Enabled");
        var rootEmail = rootSection["Email"];

        if (rootEnabled && !string.IsNullOrWhiteSpace(rootEmail) &&
            string.Equals(normalizedEmail, rootEmail.Trim().ToLowerInvariant(), StringComparison.OrdinalIgnoreCase))
        {
          Console.WriteLine($"[IdentifyUserType] Email '{email}' identificado como Root Admin");
          return Ok(new UserTypeResponse { UserType = "Admin", Exists = true });
        }

        // CORREÇÃO: Verifica tabela de administradores PRIMEIRO (PRIORIDADE 1)
        // CORREÇÃO CRÍTICA: Usa o email NORMALIZADO que já foi criado acima
        // Executa sequencialmente para evitar problema de concorrência no DbContext
        Console.WriteLine($"[IdentifyUserType] Buscando em Administradores com email normalizado: '{normalizedEmail}' (original: '{email}')");
        var administrador = await _administradorRepository.GetByEmailAsync(normalizedEmail);
        Console.WriteLine($"[IdentifyUserType] Busca em Administradores: {(administrador != null ? $"✓ ENCONTRADO (ID: {administrador.Id}, Email BD: '{administrador.Email}')" : "✗ NÃO ENCONTRADO")}");
        
        if (administrador != null)
        {
          Console.WriteLine($"[IdentifyUserType] ✓ Email '{email}' identificado como Admin (ID: {administrador.Id}, Email no BD: '{administrador.Email}')");
          
          // Verifica se também existe na tabela de usuários (apenas para log/debug)
          var usuario = await _usuarioRepository.GetByEmailAsync(normalizedEmail);
          if (usuario != null)
          {
            Console.WriteLine($"[IdentifyUserType] ⚠ AVISO: Email '{email}' também existe na tabela Usuarios (ID: {usuario.Id})! Priorizando Admin.");
          }
          
          return Ok(new UserTypeResponse { UserType = "Admin", Exists = true });
        }

        // PRIORIDADE 2: Só verifica tabela de usuários se NÃO encontrou em Administradores
        Console.WriteLine($"[IdentifyUserType] Administrador não encontrado. Buscando na tabela Usuarios com email normalizado: '{normalizedEmail}'");
        var usuario2 = await _usuarioRepository.GetByEmailAsync(normalizedEmail);
        Console.WriteLine($"[IdentifyUserType] Busca em Usuarios: {(usuario2 != null ? $"✓ ENCONTRADO (ID: {usuario2.Id}, Email BD: '{usuario2.Email}')" : "✗ NÃO ENCONTRADO")}");
        
        if (usuario2 != null)
        {
          Console.WriteLine($"[IdentifyUserType] ✓ Email '{email}' identificado como User (ID: {usuario2.Id}, Email no BD: '{usuario2.Email}')");
          return Ok(new UserTypeResponse { UserType = "User", Exists = true });
        }

        // Email não encontrado em nenhuma tabela
        Console.WriteLine($"[IdentifyUserType] ✗ Email '{email}' não encontrado em nenhuma tabela");
        return Ok(new UserTypeResponse { UserType = "", Exists = false });
      }
      catch (Exception ex)
      {
        Console.WriteLine($"[IdentifyUserType] ERRO ao identificar tipo de usuário para email '{email}': {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
      }
    }
    #endregion

    #region Private Methods
    private bool TryAuthenticateRootAdmin(LoginRequest request, out LoginResponse response)
    {
      response = null!;

      var rootSection = _configuration.GetSection("RootAdmin");
      var enabled = rootSection.GetValue<bool>("Enabled");
      var email = rootSection["Email"];
      var password = rootSection["Password"];

      if (!enabled || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        return false;

      if (!string.Equals(request.Email, email, StringComparison.OrdinalIgnoreCase))
        return false;

      if (request.Senha != password)
        return false;

      response = BuildLoginResponse(0, email, "Admin");
      return true;
    }

    private LoginResponse BuildLoginResponse(int userId, string email, string role)
    {
      var minutes = GetAccessTokenExpirationMinutes();
      var accessToken = _authService.GenerateAccessToken(userId, email, role);
      var refreshToken = _authService.GenerateRefreshToken();

      return new LoginResponse
      {
        AccessToken = accessToken,
        RefreshToken = refreshToken,
        ExpiresAt = DateTime.UtcNow.AddMinutes(minutes),
        UserId = userId,
        Email = email,
        Role = role
      };
    }

    private double GetAccessTokenExpirationMinutes()
    {
      var jwtSection = _configuration.GetSection("JwtSettings");
      return double.TryParse(jwtSection["AccessTokenExpirationMinutes"], out var minutes)
          ? minutes
          : 15;
    }
    #endregion
  }
}

