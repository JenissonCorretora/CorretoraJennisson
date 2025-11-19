using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CorretoraJenissonLuckwuAPI.Migrations
{
    /// <inheritdoc />
    public partial class MakeStreamUserIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Torna Stream_user_id nullable na tabela Usuarios
            migrationBuilder.AlterColumn<string>(
                name: "Stream_user_id",
                table: "Usuarios",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverte para não-nullable (com valor padrão vazio para registros existentes)
            migrationBuilder.Sql(@"
                UPDATE ""Usuarios"" 
                SET ""Stream_user_id"" = '' 
                WHERE ""Stream_user_id"" IS NULL;
            ");

            migrationBuilder.AlterColumn<string>(
                name: "Stream_user_id",
                table: "Usuarios",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}

