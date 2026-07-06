import { describe, it, expect } from 'vitest';
import { APACHE_LICENSE_URL } from './constants';

describe('constants', () => {
  describe('APACHE_LICENSE_URL', () => {
    it('should be defined', () => {
      expect(APACHE_LICENSE_URL).toBeDefined();
    });

    it('should be a string', () => {
      expect(typeof APACHE_LICENSE_URL).toBe('string');
    });

    it('should point to GitHub LICENSE file', () => {
      expect(APACHE_LICENSE_URL).toContain('github.com');
      expect(APACHE_LICENSE_URL).toContain('LICENSE');
    });

    it('should contain the repo path', () => {
      expect(APACHE_LICENSE_URL).toContain('tazama-lf');
      expect(APACHE_LICENSE_URL).toContain('config-studio');
    });

    it('should be a valid URL format', () => {
      expect(APACHE_LICENSE_URL).toMatch(/^https:\/\/.+/);
    });
  });
});
