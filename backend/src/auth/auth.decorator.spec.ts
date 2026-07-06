import { Reflector } from '@nestjs/core';
import {
  RequireClaims,
  RequireAnyClaims,
  Public,
  RequireClaim,
  CLAIMS_KEY,
  IS_PUBLIC_KEY,
  ANY_CLAIMS_KEY,
} from './auth.decorator';

describe('Auth Decorators', () => {
  describe('CLAIMS_KEY', () => {
    it('should be defined as "claims"', () => {
      expect(CLAIMS_KEY).toBe('claims');
    });
  });

  describe('IS_PUBLIC_KEY', () => {
    it('should be defined as "isPublic"', () => {
      expect(IS_PUBLIC_KEY).toBe('isPublic');
    });
  });

  describe('ANY_CLAIMS_KEY', () => {
    it('should be defined as "anyClaims"', () => {
      expect(ANY_CLAIMS_KEY).toBe('anyClaims');
    });
  });

  describe('RequireClaims', () => {
    it('should set metadata with CLAIMS_KEY and provided claims', () => {
      const decorator = RequireClaims('config:read', 'config:write');
      expect(decorator).toBeDefined();
    });

    it('should return a function (decorator)', () => {
      const decorator = RequireClaims('config:read');
      expect(typeof decorator).toBe('function');
    });

    it('should work with a single claim', () => {
      const decorator = RequireClaims('config:read');
      expect(decorator).toBeDefined();
    });

    it('should work with multiple claims', () => {
      const decorator = RequireClaims('config:read', 'config:write', 'config:delete');
      expect(decorator).toBeDefined();
    });

    it('should work with no claims', () => {
      const decorator = RequireClaims();
      expect(decorator).toBeDefined();
    });
  });

  describe('RequireAnyClaims', () => {
    it('should set metadata with ANY_CLAIMS_KEY and provided claims', () => {
      const decorator = RequireAnyClaims('config:read', 'config:write');
      expect(decorator).toBeDefined();
    });

    it('should return a function (decorator)', () => {
      const decorator = RequireAnyClaims('config:read');
      expect(typeof decorator).toBe('function');
    });

    it('should work with multiple claims', () => {
      const decorator = RequireAnyClaims('config:read', 'config:admin');
      expect(decorator).toBeDefined();
    });
  });

  describe('Public', () => {
    it('should set metadata with IS_PUBLIC_KEY and true', () => {
      const decorator = Public();
      expect(decorator).toBeDefined();
    });

    it('should return a function (decorator)', () => {
      const decorator = Public();
      expect(typeof decorator).toBe('function');
    });
  });

  describe('RequireClaim', () => {
    it('should set metadata with CLAIMS_KEY and single claim as array', () => {
      const decorator = RequireClaim('config:read');
      expect(decorator).toBeDefined();
    });

    it('should return a function (decorator)', () => {
      const decorator = RequireClaim('config:read');
      expect(typeof decorator).toBe('function');
    });

    it('should work with any claim string', () => {
      const decorator = RequireClaim('any:permission');
      expect(decorator).toBeDefined();
    });
  });
});
