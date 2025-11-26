/**
 * Configuração da API
 * Detecta automaticamente se está em produção ou desenvolvimento
 */
function getApiBaseUrl(): string {
  const hostname = window.location.hostname.toLowerCase();
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost');
  
  // Se não for localhost, está em produção
  const isProduction = !isLocalhost;
  
  const productionUrl = 'https://corretorajennisson-backend.onrender.com/api';
  const developmentUrl = 'http://localhost:5166/api';
  
  const url = isProduction ? productionUrl : developmentUrl;
  
  // Log para debug
  console.log('[API Config] Hostname:', hostname);
  console.log('[API Config] Is Production:', isProduction);
  console.log('[API Config] API Base URL:', url);
  
  return url;
}

function getChatHubUrl(): string {
  const hostname = window.location.hostname.toLowerCase();
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost');
  
  const isProduction = !isLocalhost;
  
  const productionUrl = 'https://corretorajennisson-backend.onrender.com/chathub';
  const developmentUrl = 'http://localhost:5166/chathub';
  
  const url = isProduction ? productionUrl : developmentUrl;
  
  console.log('[API Config] Chat Hub URL:', url);
  
  return url;
}

const API_BASE_URL = getApiBaseUrl();
const CHAT_HUB_URL = getChatHubUrl();

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

