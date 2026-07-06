import { describe, it, expect } from 'vitest';
import { API_CONFIG } from './api.config';

describe('api.config', () => {
  describe('API_CONFIG', () => {
    it('should be defined', () => {
      expect(API_CONFIG).toBeDefined();
    });

    it('should have API_BASE_URL', () => {
      expect(API_CONFIG.API_BASE_URL).toBeDefined();
      expect(typeof API_CONFIG.API_BASE_URL).toBe('string');
    });

    it('should have AUTH_BASE_URL', () => {
      expect(API_CONFIG.AUTH_BASE_URL).toBeDefined();
      expect(typeof API_CONFIG.AUTH_BASE_URL).toBe('string');
    });

    it('should have TIMEOUT as 30000', () => {
      expect(API_CONFIG.TIMEOUT).toBe(30000);
    });

    it('should have DEFAULT_HEADERS with Content-Type and Accept', () => {
      expect(API_CONFIG.DEFAULT_HEADERS['Content-Type']).toBe('application/json');
      expect(API_CONFIG.DEFAULT_HEADERS['Accept']).toBe('application/json');
    });

    describe('ENDPOINTS.AUTH', () => {
      it('should have LOGIN endpoint as "/auth/login"', () => {
        expect(API_CONFIG.ENDPOINTS.AUTH.LOGIN).toBe('/auth/login');
      });

      it('should have LOGOUT endpoint as "/auth/logout"', () => {
        expect(API_CONFIG.ENDPOINTS.AUTH.LOGOUT).toBe('/auth/logout');
      });

      it('should have PROFILE endpoint as "/auth/profile"', () => {
        expect(API_CONFIG.ENDPOINTS.AUTH.PROFILE).toBe('/auth/profile');
      });
    });

    describe('ENDPOINTS.CONFIG', () => {
      it('should have NETWORK_MAP endpoint as "/config/network-map"', () => {
        expect(API_CONFIG.ENDPOINTS.CONFIG.NETWORK_MAP).toBe('/config/network-map');
      });

      it('should have RULE endpoint as "/config/rule"', () => {
        expect(API_CONFIG.ENDPOINTS.CONFIG.RULE).toBe('/config/rule');
      });

      it('should have TYPOLOGY endpoint as "/config/typology"', () => {
        expect(API_CONFIG.ENDPOINTS.CONFIG.TYPOLOGY).toBe('/config/typology');
      });
    });
  });
});
