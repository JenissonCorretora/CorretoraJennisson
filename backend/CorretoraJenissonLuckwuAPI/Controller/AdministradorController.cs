using CorretoraJenissonLuckwuAPI.Models.Entities;
using CorretoraJenissonLuckwuAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CorretoraJenissonLuckwuAPI.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdministradorController : ControllerBase
    {
        #region Variables
        private readonly AdministradorService _services;
        #endregion


        #region Constructors
        public AdministradorController(AdministradorService service)
        {
            _services = service;
        }
        #endregion

        #region Controllers
        [HttpPost]
        public async Task<ActionResult<Administrador>> PostAdm(Administrador administrador)
        {
            try
            {
                var result = await _services.Add(administrador);
                if (result == null) return BadRequest("Erro ao adicionar administrador");
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

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Administrador>> GetAdmId(int id)
        {
            try
            {
                var result = await _services.GetById(id);
                if (result == null) return NotFound("Administrador não encontrado");
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpGet("filter")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Administrador>> GetByNameAdm(string nome)
        {
            try
            {
                var result = await _services.GetByNome(nome);
                if (result == null) return NotFound("Administrador não encontrado");
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Administrador>> AtualizarAdm(int id, Administrador administrador)
        {
            try
            {
                var administradorBanco = await _services.Post(id, administrador);
                if (administradorBanco == null) return NotFound("Administrador não encontrado");
                return Ok(administradorBanco);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeletarAdm(int id)
        {
            try
            {
                var administradorBanco = await _services.Delete(id);
                if (administradorBanco == null) return NotFound("Administrador não encontrado");
                return Ok("Administrador deletado com sucesso");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }
        #endregion
    }
}
