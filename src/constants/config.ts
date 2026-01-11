/**
 * Configuración general de la aplicación
 */

export const APP_CONFIG = {
  APP_NAME: 'CasasEG',
  ITEMS_PER_PAGE: 8,
  IMAGE_CAROUSEL_INTERVAL: 3000, // ms
  TOAST_DURATION: 3000, // ms
  CURRENCY: 'FCA',
} as const;

export const ROUTES = {
  HOME: '/',
  PROPERTIES: '/properties',
  MESSAGES: '/messages',
  PROFILE: '/profile',
} as const;

export const STORAGE_KEYS = {
  USER: 'casaseg_user',
  THEME: 'casaseg_theme',
} as const;

