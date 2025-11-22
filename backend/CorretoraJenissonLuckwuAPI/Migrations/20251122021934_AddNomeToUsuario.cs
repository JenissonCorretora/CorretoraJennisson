using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CorretoraJenissonLuckwuAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddNomeToUsuario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Verifica se a coluna já existe antes de adicionar usando SQL direto
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 
                        FROM information_schema.columns 
                        WHERE table_name = 'Usuarios' 
                        AND column_name = 'Nome'
                    ) THEN
                        ALTER TABLE ""Usuarios"" ADD COLUMN ""Nome"" text NULL;
                    END IF;
                END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Verifica se a coluna existe antes de remover
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1 
                        FROM information_schema.columns 
                        WHERE table_name = 'Usuarios' 
                        AND column_name = 'Nome'
                    ) THEN
                        ALTER TABLE ""Usuarios"" DROP COLUMN ""Nome"";
                    END IF;
                END $$;
            ");
        }
    }
}
