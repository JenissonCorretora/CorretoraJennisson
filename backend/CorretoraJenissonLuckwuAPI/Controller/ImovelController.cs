using CorretoraJenissonLuckwuAPI.Models.Entities;
using CorretoraJenissonLuckwuAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CorretoraJenissonLuckwuAPI.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImovelController : ControllerBase
    {
        #region Variables
        private readonly ImovelService _services;
        #endregion

        #region Constructors
        public ImovelController(ImovelService service)
        {
            _services = service;
        }
        #endregion

        #region Controllers
        [HttpGet]
        public async Task<ActionResult<List<Imovel>>> GetAll()
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
        public async Task<ActionResult<Imovel>> GetById(int id)
        {
            try
            {
                var result = await _services.GetById(id);
                if (result == null) return NotFound("Imóvel não encontrado");
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Imovel>> Post(Imovel imovel)
        {
            try
            {
                var result = await _services.Add(imovel);
                if (result == null) return BadRequest("Erro ao adicionar imóvel");
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Imovel>> Update(int id, Imovel imovel)
        {
            try
            {
                var result = await _services.Update(id, imovel);
                if (result == null) return NotFound("Imóvel não encontrado");
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await _services.Delete(id);
                if (result == null) return NotFound("Imóvel não encontrado");
                return Ok("Imóvel deletado com sucesso");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpGet("filter/cidade")]
        public async Task<ActionResult<List<Imovel>>> GetByCidade([FromQuery] string cidade)
        {
            try
            {
                var result = await _services.GetByCidade(cidade);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpGet("filter/tipo")]
        public async Task<ActionResult<List<Imovel>>> GetByTipo([FromQuery] string tipo)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(tipo))
                {
                    return BadRequest("Tipo é obrigatório");
                }

                var result = await _services.GetByTipo(tipo);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpGet("filter/status")]
        public async Task<ActionResult<List<Imovel>>> GetByStatus([FromQuery] StatusImovel status)
        {
            try
            {
                var result = await _services.GetByStatus(status);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpGet("filter/preco")]
        public async Task<ActionResult<List<Imovel>>> GetByPrecoRange([FromQuery] decimal precoMin, [FromQuery] decimal precoMax)
        {
            try
            {
                var result = await _services.GetByPrecoRange(precoMin, precoMax);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpPatch("{id}/ativo")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Imovel>> AtualizarStatusAtivo(int id, [FromBody] AtualizarStatusAtivoRequest request)
        {
            try
            {
                var imovel = await _services.UpdateAtivo(id, request.Ativo);
                if (imovel == null) return NotFound("Imóvel não encontrado");
                return Ok(imovel);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }
        #endregion
    }

    public class AtualizarStatusAtivoRequest
    {
        public bool Ativo { get; set; }
    }
}

