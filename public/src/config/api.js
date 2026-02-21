/**
 * Configuration de l'API
 * En dev (Vite) : /api est proxyfié vers localhost:8000
 * En prod : utiliser VITE_API_URL ou même origine
 */
const isDev = import.meta.env.DEV;
export const API_BASE_URL = import.meta.env.VITE_API_URL || (isDev ? '' : 'http://localhost:8000');
export const API_PATH = '/api';

export const API_ENDPOINTS = {
  MENU: `${API_BASE_URL}${API_PATH}/menu.php`,
  AUTH: `${API_BASE_URL}${API_PATH}/auth.php`,
  HOURS: `${API_BASE_URL}${API_PATH}/hours.php`,
  COMMANDE: `${API_BASE_URL}${API_PATH}/commande.php`,
  ADMIN: `${API_BASE_URL}${API_PATH}/admin.php`,
  ACTIF: `${API_BASE_URL}${API_PATH}/actif.php`,
  CLIENT: `${API_BASE_URL}${API_PATH}/client.php`,
  COMMANDE_PHONE: `${API_BASE_URL}${API_PATH}/commande_phone.php`,
};
