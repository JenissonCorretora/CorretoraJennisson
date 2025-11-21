using CorretoraJenissonLuckwuAPI.Models.DTOs;
using CorretoraJenissonLuckwuAPI.Models.Entities;
using CorretoraJenissonLuckwuAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CorretoraJenissonLuckwuAPI.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MensagemController : ControllerBase
    {
        #region Variables
        private readonly MensagemService _service;
        #endregion

        #region Constructors
        public MensagemController(MensagemService service)
        {
            _service = service;
        }
        #endregion

        #region Controllers
        [HttpGet]
        public async Task<ActionResult<List<MensagemDTO>>> GetAll()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized("Usuário não autenticado ou ID de usuário inválido.");
                }

                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                // Admin vê todas as mensagens, usuário vê apenas as suas
                List<MensagemDTO> result;
                if (role == "Admin")
                {
                    result = await _service.GetAll();
                }
                else
                {
                    result = await _service.GetByUsuarioId(userId);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpGet("nao-lidas")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<int>> GetCountNaoLidas()
        {
            try
            {
                var count = await _service.GetCountNaoLidas();
                return Ok(count);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpGet("nao-lidas/lista")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<MensagemDTO>>> GetNaoLidas()
        {
            try
            {
                var result = await _service.GetNaoLidas();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MensagemDTO>> GetById(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized("Usuário não autenticado ou ID de usuário inválido.");
                }

                var role = User.FindFirst(ClaimTypes.Role)?.Value;
                var mensagem = await _service.GetById(id);

                if (mensagem == null)
                {
                    return NotFound("Mensagem não encontrada");
                }

                // Verifica se o usuário tem permissão para ver esta mensagem
                if (role != "Admin" && mensagem.Usuario_Id != userId)
                {
                    return Forbid("Você não tem permissão para ver esta mensagem");
                }

                return Ok(mensagem);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<MensagemDTO>> Post(CreateMensagemRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized("Usuário não autenticado ou ID de usuário inválido.");
                }

                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                var mensagem = new Mensagem
                {
                    Usuario_Id = userId,
                    Conteudo = request.Conteudo,
                    Remetente_Tipo = role == "Admin" ? RemetenteTipo.Administrador : RemetenteTipo.Usuario,
                    Lida = false
                };

                // Se for admin, preenche o Administrador_Id
                if (role == "Admin")
                {
                    mensagem.Administrador_Id = userId;
                }

                var result = await _service.Add(mensagem);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }

        [HttpPut("{id}/ler")]
        public async Task<ActionResult> MarkAsRead(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized("Usuário não autenticado ou ID de usuário inválido.");
                }

                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                // Apenas admin pode marcar como lida
                if (role != "Admin")
                {
                    return Forbid("Apenas administradores podem marcar mensagens como lidas");
                }

                var success = await _service.MarkAsRead(id);
                if (!success)
                {
                    return NotFound("Mensagem não encontrada");
                }

                return Ok(new { message = "Mensagem marcada como lida" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }
        #endregion
    }
}

