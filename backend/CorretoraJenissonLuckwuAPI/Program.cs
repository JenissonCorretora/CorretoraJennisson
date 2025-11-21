using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using CorretoraJenissonLuckwuAPI.EFModel.Configurations;
using CorretoraJenissonLuckwuAPI.Infrastructure;
using CorretoraJenissonLuckwuAPI.Repository;
using CorretoraJenissonLuckwuAPI.Services;
using Scalar.AspNetCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddRouting(o =>
{
    o.LowercaseUrls = true;
    o.LowercaseQueryStrings = true;
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddDbContext<CorretoraJenissonLuckwuDb>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.MigrationsAssembly(typeof(Program).Assembly.FullName)));
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// JWT Configuration
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey não configurado no appsettings.json");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("UserOnly", policy => policy.RequireRole("User"));
    options.AddPolicy("AdminOrUser", policy => policy.RequireRole("Admin", "User"));
});

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Repositories
builder.Services.AddScoped<AdministradorRepository>();
builder.Services.AddScoped<ImovelRepository>();
builder.Services.AddScoped<UsuarioRepository>();
builder.Services.AddScoped<ImagemImovelRepository>();
builder.Services.AddScoped<FavoritoRepository>();
builder.Services.AddScoped<ConteudoSiteRepository>();

// Services
builder.Services.AddScoped<AdministradorService>();
builder.Services.AddScoped<ImovelService>();
builder.Services.AddScoped<UsuarioService>();
builder.Services.AddScoped<ImagemImovelService>();
builder.Services.AddScoped<FavoritoService>();
builder.Services.AddScoped<PasswordService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ConteudoSiteService>();
builder.Services.AddScoped<FileStorageService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseCors("AllowAngularApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
