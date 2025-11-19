using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CorretoraJenissonLuckwuAPI.Migrations
{
    /// <inheritdoc />
    public partial class MakeAdministradorStreamUserIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Stream_user_id",
                table: "Administradores",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Stream_user_id",
                table: "Administradores",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
