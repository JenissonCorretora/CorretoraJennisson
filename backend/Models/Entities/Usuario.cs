using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CorretoraJenissonLuckwuAPI.Models.Entities
{
  public class Usuario
  {
    #region Id
    [Key]
    public int Id { get; set; }
    #endregion


    #region Properties
    [Required]
    [EmailAddress]
    public string? Email { get; set; }

    [Required]
    public string? Senha { get; set; }

    // Stream_user_id comentado - será implementado no futuro para chatbot
    // [Required]
    public string? Stream_user_id { get; set; }

    [Phone]
    public string? Telefone { get; set; }
    #endregion

    #region Generated Data
    public DateTime Created_at { get; set; } = DateTime.UtcNow;

    public DateTime Updated_at { get; set; } = DateTime.UtcNow;
    #endregion

    #region Navigation Properties
    public virtual ICollection<Favorito> Favoritos { get; set; } = new List<Favorito>();
    #endregion
  }
}

