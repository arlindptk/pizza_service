/**
 * Configuration de l'API
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  MENU: `${API_BASE_URL}/menu.php`,
  AUTH: `${API_BASE_URL}/auth.php`,
  TEST: `${API_BASE_URL}/test.php`,
  DEBUG: `${API_BASE_URL}/debug.php`,
};
