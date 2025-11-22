using CorretoraJenissonLuckwuAPI.Models.Entities;
using CorretoraJenissonLuckwuAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CorretoraJenissonLuckwuAPI.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuarioController : ControllerBase
    {
        #region Variables
        private readonly UsuarioService _services;
        #endregion

        #region Constructors
        public UsuarioController(UsuarioService service)
        {
            _services = service;
        }
        #endregion

        #region Controllers
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<Usuario>>> GetAll()
        {
            try
            {
                var result = await _services.GetAll();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Usuario>> GetById(int id)
        {
            try
            {
                var result = await _services.GetById(id);
                if (result == null) return NotFound("Usuário não encontrado");
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Usuario>> Post(Usuario usuario)
        {
            try
            {
                var result = await _services.Add(usuario);
                if (result == null) return BadRequest("Erro ao adicionar usuário");
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                // Retorna erro de validação (email duplicado) com status 409 (Conflict)
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<Usuario>> Update(int id, Usuario usuario)
        {
            try
            {
                var result = await _services.Update(id, usuario);
                if (result == null) return NotFound("Usuário não encontrado");
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await _services.Delete(id);
                if (result == null) return NotFound("Usuário não encontrado");
                return Ok("Usuário deletado com sucesso");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpGet("filter/email")]
        public async Task<ActionResult<Usuario>> GetByEmail([FromQuery] string email)
        {
            try
            {
                var result = await _services.GetByEmail(email);
                if (result == null) return NotFound("Usuário não encontrado");
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpGet("filter/stream-user-id")]
        public async Task<ActionResult<Usuario>> GetByStreamUserId([FromQuery] string streamUserId)
        {
            try
            {
                var result = await _services.GetByStreamUserId(streamUserId);
                if (result == null) return NotFound("Usuário não encontrado");
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }
        #endregion
    }
}

