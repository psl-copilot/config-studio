import { ENV } from './environment.config';

export const API_CONFIG = {
  API_BASE_URL: ENV.API_BASE_URL,
  AUTH_BASE_URL: ENV.API_BASE_URL,
  TIMEOUT: 30000,

  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },

  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      PROFILE: '/auth/profile',
    },
    CONFIG: {
      NETWORK_MAP: '/config/network-map',
      RULE: '/config/rule',
      TYPOLOGY: '/config/typology',
    },
  },
} as const;
