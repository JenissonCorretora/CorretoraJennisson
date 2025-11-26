# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copiar arquivos .csproj primeiro (para cache de layers)
COPY ["../EFModel/EFModel.csproj", "../EFModel/"]
COPY ["../Models/Models.csproj", "../Models/"]
COPY ["../Repository/Repository.csproj", "../Repository/"]
COPY ["../Services/Services.csproj", "../Services/"]
COPY ["CorretoraJenissonLuckwuAPI.csproj", "CorretoraJenissonLuckwuAPI/"]

# Restaurar dependências
WORKDIR "/src/CorretoraJenissonLuckwuAPI"
RUN dotnet restore "CorretoraJenissonLuckwuAPI.csproj"

# Copiar todo o código fonte
WORKDIR /src
COPY ../EFModel/ ../EFModel/
COPY ../Models/ ../Models/
COPY ../Repository/ ../Repository/
COPY ../Services/ ../Services/
COPY CorretoraJenissonLuckwuAPI/ CorretoraJenissonLuckwuAPI/

# Build e publish
WORKDIR "/src/CorretoraJenissonLuckwuAPI"
RUN dotnet build "CorretoraJenissonLuckwuAPI.csproj" -c Release -o /app/build
RUN dotnet publish "CorretoraJenissonLuckwuAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Copiar arquivos publicados
COPY --from=build /app/publish .

# Expor porta (Render usa variável PORT)
EXPOSE 8080

# Comando para iniciar
ENTRYPOINT ["dotnet", "CorretoraJenissonLuckwuAPI.dll"]

