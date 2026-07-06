import { describe, it, expect } from 'vitest';
import { ROUTES } from './routes.config';

describe('routes.config', () => {
  describe('ROUTES', () => {
    it('should be defined', () => {
      expect(ROUTES).toBeDefined();
    });

    it('should have LOGIN route as "/login"', () => {
      expect(ROUTES.LOGIN).toBe('/login');
    });

    it('should have DASHBOARD route as "/dashboard"', () => {
      expect(ROUTES.DASHBOARD).toBe('/dashboard');
    });

    it('should have NETWORK_MAP route as "/network-map"', () => {
      expect(ROUTES.NETWORK_MAP).toBe('/network-map');
    });

    it('should have RULE route as "/rule"', () => {
      expect(ROUTES.RULE).toBe('/rule');
    });

    it('should have TYPOLOGY route as "/typology"', () => {
      expect(ROUTES.TYPOLOGY).toBe('/typology');
    });

    it('should have all 5 routes defined', () => {
      const routeKeys = Object.keys(ROUTES);
      expect(routeKeys).toHaveLength(5);
    });

    it('should have all routes starting with "/"', () => {
      Object.values(ROUTES).forEach((route) => {
        expect(route.startsWith('/')).toBe(true);
      });
    });

    it('should have unique route values', () => {
      const routeValues = Object.values(ROUTES);
      const uniqueValues = new Set(routeValues);
      expect(uniqueValues.size).toBe(routeValues.length);
    });
  });
});
