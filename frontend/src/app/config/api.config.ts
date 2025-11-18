/**
 * Configuração da API
 */
export const API_CONFIG = {
  baseUrl: 'http://localhost:5166/api',
  endpoints: {
    auth: {
      loginAdmin: '/auth/login-administrador',
      loginUsuario: '/auth/login-usuario',
      refreshToken: '/auth/refresh-token'
    },
    imoveis: '/imovel',
    favoritos: '/favorito',
    imagens: '/imagemimovel',
    usuarios: '/usuario',
    administradores: '/administrador',
    conteudoSite: '/conteudosite'
  }
};

/**
 * Chaves para localStorage
 */
export const STORAGE_KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  user: 'user_data',
  role: 'user_role'
};

