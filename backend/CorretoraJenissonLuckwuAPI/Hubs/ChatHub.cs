using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Linq;
using CorretoraJenissonLuckwuAPI.Models.Entities;
using CorretoraJenissonLuckwuAPI.Models.DTOs;
using CorretoraJenissonLuckwuAPI.Services;

namespace CorretoraJenissonLuckwuAPI.Hubs
{
  [Authorize]
  public class ChatHub : Hub
  {
    private readonly MensagemService _mensagemService;

    public ChatHub(MensagemService mensagemService)
    {
      _mensagemService = mensagemService;
    }

    public override async Task OnConnectedAsync()
    {
      try
      {
        var userId = GetUserId();
        var role = GetUserRole();

        Console.WriteLine($"ChatHub: Usuário {userId} (Role: {role}) conectado. ConnectionId: {Context.ConnectionId}");

        if (role == "Admin")
        {
          // Admin entra no grupo "admins" para receber notificações
          await Groups.AddToGroupAsync(Context.ConnectionId, "admins");
          Console.WriteLine($"ChatHub: Admin {userId} adicionado ao grupo 'admins'");
        }
        else
        {
          // Usuário entra no grupo específico do seu ID
          await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
          Console.WriteLine($"ChatHub: Usuário {userId} adicionado ao grupo 'user_{userId}'");
        }

        await base.OnConnectedAsync();
      }
      catch (Exception ex)
      {
        Console.WriteLine($"ChatHub: Erro em OnConnectedAsync: {ex.Message}");
        Console.WriteLine($"ChatHub: Stack trace: {ex.StackTrace}");
        throw;
      }
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
      await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(string conteudo, int? usuarioIdDestino = null)
    {
      try
      {
        var userId = GetUserId();
        var role = GetUserRole();

        if (string.IsNullOrWhiteSpace(conteudo))
        {
          await Clients.Caller.SendAsync("Error", "Mensagem não pode estar vazia");
          return;
        }

        if (conteudo.Length > 2000)
        {
          await Clients.Caller.SendAsync("Error", "Mensagem muito longa (máximo 2000 caracteres)");
          return;
        }

        // Se for admin e tiver usuarioIdDestino, usa esse ID, senão usa o userId do admin
        // Se for usuário, sempre usa o próprio userId
        int usuarioIdFinal = role == "Admin" && usuarioIdDestino.HasValue 
          ? usuarioIdDestino.Value 
          : userId;

        var mensagem = new Mensagem
        {
          Usuario_Id = usuarioIdFinal,
          Conteudo = conteudo,
          Remetente_Tipo = role == "Admin" ? RemetenteTipo.Administrador : RemetenteTipo.Usuario,
          Lida = false
        };

        if (role == "Admin")
        {
          mensagem.Administrador_Id = userId;
        }

        var mensagemDTO = await _mensagemService.Add(mensagem);

        if (role == "Admin")
        {
          // Admin enviou mensagem - notifica o usuário específico
          await Clients.Group($"user_{mensagemDTO.Usuario_Id}").SendAsync("ReceiveMessage", mensagemDTO);
          await Clients.Caller.SendAsync("MessageSent", mensagemDTO);
        }
        else
        {
          // Usuário enviou mensagem - notifica todos os admins
          await Clients.Group("admins").SendAsync("ReceiveMessage", mensagemDTO);
          await Clients.Caller.SendAsync("MessageSent", mensagemDTO);
        }
      }
      catch (UnauthorizedAccessException ex)
      {
        await Clients.Caller.SendAsync("Error", $"Erro de autenticação: {ex.Message}");
      }
      catch (Exception ex)
      {
        // Log do erro no servidor
        Console.WriteLine($"Erro ao enviar mensagem no ChatHub: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        await Clients.Caller.SendAsync("Error", $"Erro ao enviar mensagem: {ex.Message}");
      }
    }

    public async Task MarkAsRead(int mensagemId)
    {
      var role = GetUserRole();

      if (role != "Admin")
      {
        await Clients.Caller.SendAsync("Error", "Apenas administradores podem marcar mensagens como lidas");
        return;
      }

      try
      {
        var success = await _mensagemService.MarkAsRead(mensagemId);
        if (success)
        {
          var mensagem = await _mensagemService.GetById(mensagemId);
          if (mensagem != null)
          {
            // Notifica o usuário que sua mensagem foi lida
            await Clients.Group($"user_{mensagem.Usuario_Id}").SendAsync("MessageRead", mensagemId);
            await Clients.Caller.SendAsync("MessageMarkedAsRead", mensagemId);
          }
        }
        else
        {
          await Clients.Caller.SendAsync("Error", "Mensagem não encontrada");
        }
      }
      catch (Exception ex)
      {
        await Clients.Caller.SendAsync("Error", $"Erro ao marcar como lida: {ex.Message}");
      }
    }

    private int GetUserId()
    {
      try
      {
        if (Context.User == null)
        {
          Console.WriteLine("ChatHub: Context.User é null");
          throw new UnauthorizedAccessException("Usuário não autenticado - Context.User é null");
        }

        var userIdClaim = Context.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
          Console.WriteLine("ChatHub: ClaimTypes.NameIdentifier não encontrado");
          Console.WriteLine($"ChatHub: Claims disponíveis: {string.Join(", ", Context.User.Claims.Select(c => $"{c.Type}={c.Value}"))}");
          throw new UnauthorizedAccessException("Usuário não autenticado - ClaimTypes.NameIdentifier não encontrado");
        }

        if (!int.TryParse(userIdClaim.Value, out int userId))
        {
          Console.WriteLine($"ChatHub: Falha ao converter userId '{userIdClaim.Value}' para int");
          throw new UnauthorizedAccessException($"ID de usuário inválido: {userIdClaim.Value}");
        }

        return userId;
      }
      catch (UnauthorizedAccessException)
      {
        throw;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"ChatHub: Erro inesperado em GetUserId: {ex.Message}");
        throw new UnauthorizedAccessException($"Erro ao obter ID do usuário: {ex.Message}");
      }
    }

    private string GetUserRole()
    {
      return Context.User?.FindFirst(ClaimTypes.Role)?.Value ?? "User";
    }
  }
}

