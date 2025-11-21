using System.ComponentModel.DataAnnotations;
using CorretoraJenissonLuckwuAPI.Models.Entities;

namespace CorretoraJenissonLuckwuAPI.Models.DTOs
{
    public class MensagemDTO
    {
        public int Id { get; set; }
        public int Usuario_Id { get; set; }
        public string? Usuario_Email { get; set; }
        public string? Usuario_Nome { get; set; }
        public int? Administrador_Id { get; set; }
        public string? Administrador_Nome { get; set; }
        public string Conteudo { get; set; } = string.Empty;
        public RemetenteTipo Remetente_Tipo { get; set; }
        public bool Lida { get; set; }
        public DateTime Created_At { get; set; }
    }

    public class CreateMensagemRequest
    {
        [Required]
        [MaxLength(2000)]
        public string Conteudo { get; set; } = string.Empty;

        /// <summary>
        /// ID do usuário destinatário (apenas para administradores).
        /// Se não fornecido e o remetente for admin, a mensagem será vinculada ao próprio admin (comportamento antigo).
        /// Se fornecido, a mensagem será vinculada ao usuário especificado.
        /// </summary>
        public int? UsuarioIdDestino { get; set; }
    }
}

