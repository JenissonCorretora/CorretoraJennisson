using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CorretoraJenissonLuckwuAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddMensagemTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Mensagens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Usuario_Id = table.Column<int>(type: "integer", nullable: false),
                    Administrador_Id = table.Column<int>(type: "integer", nullable: true),
                    Conteudo = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Remetente_Tipo = table.Column<int>(type: "integer", nullable: false),
                    Lida = table.Column<bool>(type: "boolean", nullable: false),
                    Created_At = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mensagens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Mensagens_Administradores_Administrador_Id",
                        column: x => x.Administrador_Id,
                        principalTable: "Administradores",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Mensagens_Usuarios_Usuario_Id",
                        column: x => x.Usuario_Id,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Mensagens_Administrador_Id",
                table: "Mensagens",
                column: "Administrador_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Mensagens_Usuario_Id",
                table: "Mensagens",
                column: "Usuario_Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Mensagens");
        }
    }
}
