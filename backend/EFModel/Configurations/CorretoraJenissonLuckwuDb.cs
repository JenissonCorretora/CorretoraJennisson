using CorretoraJenissonLuckwuAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace CorretoraJenissonLuckwuAPI.EFModel.Configurations
{
    public class CorretoraJenissonLuckwuDb: DbContext
    {
      #region Constructors
        public CorretoraJenissonLuckwuDb(DbContextOptions<CorretoraJenissonLuckwuDb> options) : base(options)
        {
        }
        #endregion
        #region DbSets
        public DbSet<Administrador> Administradores { get; set; }
        public DbSet<Favorito> Favoritos { get; set; }
        public DbSet<ImagemImovel> ImagemImoveis { get; set; }
        public DbSet<Imovel> Imoveis { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<ConteudoSite> ConteudosSite { get; set; }
        public DbSet<Mensagem> Mensagens { get; set; }
        #endregion
    }
}
