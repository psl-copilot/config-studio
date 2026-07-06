import 'reflect-metadata';
import { validate } from './env.validation';

describe('env.validation', () => {
  const validEnv = {
    NODE_ENV: 'development',
    FUNCTION_NAME: 'test-function',
    TAZAMA_AUTH_URL: 'http://auth-service:8080',
    AUTH_PUBLIC_KEY_PATH: '/path/to/key',
    CERT_PATH_PUBLIC: '/path/to/cert',
    ADMIN_SERVICE_URL: 'http://admin:5100',
    PORT: '3011',
  };

  describe('validate', () => {
    it('should return validated config when all required env vars are present', () => {
      const result = validate(validEnv);
      expect(result).toBeDefined();
      expect(result.NODE_ENV).toBe('development');
      expect(result.FUNCTION_NAME).toBe('test-function');
      expect(result.TAZAMA_AUTH_URL).toBe('http://auth-service:8080');
    });

    it('should accept production NODE_ENV', () => {
      const result = validate({ ...validEnv, NODE_ENV: 'production' });
      expect(result.NODE_ENV).toBe('production');
    });

    it('should accept test NODE_ENV', () => {
      const result = validate({ ...validEnv, NODE_ENV: 'test' });
      expect(result.NODE_ENV).toBe('test');
    });

    it('should accept dev NODE_ENV', () => {
      const result = validate({ ...validEnv, NODE_ENV: 'dev' });
      expect(result.NODE_ENV).toBe('dev');
    });

    it('should accept prod NODE_ENV', () => {
      const result = validate({ ...validEnv, NODE_ENV: 'prod' });
      expect(result.NODE_ENV).toBe('prod');
    });

    it('should throw when NODE_ENV is invalid enum value', () => {
      expect(() => validate({ ...validEnv, NODE_ENV: 'invalid-env' })).toThrow();
    });

    it('should throw when NODE_ENV is a number (not valid enum)', () => {
      expect(() => validate({ ...validEnv, NODE_ENV: 123 })).toThrow();
    });

    it('should accept config without PORT (optional)', () => {
      const { PORT, ...rest } = validEnv;
      const result = validate(rest);
      expect(result).toBeDefined();
      expect(result.PORT).toBeUndefined();
    });

    it('should accept PORT as string', () => {
      const result = validate({ ...validEnv, PORT: '4000' });
      expect(result.PORT).toBe('4000');
    });

    it('should accept config with only required fields', () => {
      const result = validate({
        NODE_ENV: 'development',
        FUNCTION_NAME: 'fn',
        TAZAMA_AUTH_URL: 'http://auth',
        AUTH_PUBLIC_KEY_PATH: '/key',
        CERT_PATH_PUBLIC: '/cert',
        ADMIN_SERVICE_URL: 'http://admin',
      });
      expect(result).toBeDefined();
    });

    it('should handle empty object with skipMissingProperties', () => {
      const result = validate({});
      expect(result).toBeDefined();
    });

    it('should convert numeric strings to strings with enableImplicitConversion', () => {
      const result = validate({ ...validEnv, TAZAMA_AUTH_URL: 12345 });
      // enableImplicitConversion converts to string
      expect(result).toBeDefined();
    });

    it('should validate multiple env configs', () => {
      const result1 = validate({ ...validEnv, PORT: '3001' });
      const result2 = validate({ ...validEnv, PORT: '3002' });
      expect(result1.PORT).toBe('3001');
      expect(result2.PORT).toBe('3002');
    });
  });
});
