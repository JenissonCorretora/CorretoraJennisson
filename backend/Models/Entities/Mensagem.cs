using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CorretoraJenissonLuckwuAPI.Models.Entities
{
    public enum RemetenteTipo
    {
        Usuario = 1,
        Administrador = 2
    }

    public class Mensagem
    {
        #region Id
        [Key]
        public int Id { get; set; }
        #endregion

        #region Properties
        [Required]
        public int Usuario_Id { get; set; }

        public int? Administrador_Id { get; set; } // Nullable - só preenchido quando admin responde

        [Required]
        [MaxLength(2000)]
        public string Conteudo { get; set; } = string.Empty;

        [Required]
        public RemetenteTipo Remetente_Tipo { get; set; }

        [Required]
        public bool Lida { get; set; } = false;
        #endregion

        #region Generated Data
        public DateTime Created_At { get; set; } = DateTime.UtcNow;
        #endregion

        #region Navigation Properties
        [ForeignKey(nameof(Usuario_Id))]
        public virtual Usuario? Usuario { get; set; }

        [ForeignKey(nameof(Administrador_Id))]
        public virtual Administrador? Administrador { get; set; }
        #endregion
    }
}

