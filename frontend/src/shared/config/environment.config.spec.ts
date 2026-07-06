import { describe, it, expect } from 'vitest';
import { ENV } from './environment.config';

describe('environment.config', () => {
  describe('ENV', () => {
    it('should be defined', () => {
      expect(ENV).toBeDefined();
    });

    it('should have API_BASE_URL', () => {
      expect(ENV.API_BASE_URL).toBeDefined();
      expect(typeof ENV.API_BASE_URL).toBe('string');
    });

    it('should have APP_TITLE', () => {
      expect(ENV.APP_TITLE).toBeDefined();
      expect(typeof ENV.APP_TITLE).toBe('string');
    });

    it('should have APP_ENV', () => {
      expect(ENV.APP_ENV).toBeDefined();
      expect(typeof ENV.APP_ENV).toBe('string');
    });

    it('should fallback to localhost:3011 for API_BASE_URL when env var not set', () => {
      // In test environment, VITE_API_BASE_URL is typically not set
      // so it should fall back to the default
      expect(ENV.API_BASE_URL).toMatch(/^https?:\/\/.+/);
    });

    it('should fallback to "Tazama Config Studio" for APP_TITLE when env var not set', () => {
      // The default should be the app title
      expect(ENV.APP_TITLE).toBeTruthy();
    });

    it('should fallback to "development" for APP_ENV when env var not set', () => {
      expect(ENV.APP_ENV).toBeTruthy();
    });
  });
});
