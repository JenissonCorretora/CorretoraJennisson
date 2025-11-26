/**
 * Configuração da API
 * Detecta automaticamente se está em produção ou desenvolvimento
 */
const isProduction = 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1' &&
  !window.location.hostname.includes('localhost');

const API_BASE_URL = isProduction
  ? 'https://corretorajennisson-backend.onrender.com/api'
  : 'http://localhost:5166/api';

const CHAT_HUB_URL = isProduction
  ? 'https://corretorajennisson-backend.onrender.com/chathub'
  : 'http://localhost:5166/chathub';

// Log para debug (remover em produção se necessário)
console.log('[API Config] Hostname:', window.location.hostname);
console.log('[API Config] Is Production:', isProduction);
console.log('[API Config] API Base URL:', API_BASE_URL);

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  endpoints: {
    auth: {
      loginAdmin: '/auth/login-administrador',
      loginUsuario: '/auth/login-usuario',
      refreshToken: '/auth/refresh-token',
      identifyUserType: '/auth/identify-user-type',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password'
    },
    imoveis: '/imovel',
    favoritos: '/favorito',
    imagens: '/imagemimovel',
    usuarios: '/usuario',
    administradores: '/administrador',
    conteudoSite: '/conteudosite',
    mensagens: '/mensagem',
    chatHub: CHAT_HUB_URL
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

