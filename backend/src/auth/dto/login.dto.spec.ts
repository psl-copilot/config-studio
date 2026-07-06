import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('should be defined', () => {
    expect(LoginDto).toBeDefined();
  });

  it('should have username and password properties', () => {
    const dto = new LoginDto();
    expect(dto).toHaveProperty('username');
    expect(dto).toHaveProperty('password');
  });

  describe('validation', () => {
    it('should pass with valid username and password', () => {
      const dto = plainToInstance(LoginDto, {
        username: 'test@example.com',
        password: 'password123',
      });
      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail when username is empty', () => {
      const dto = plainToInstance(LoginDto, {
        username: '',
        password: 'password123',
      });
      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail when password is empty', () => {
      const dto = plainToInstance(LoginDto, {
        username: 'test@example.com',
        password: '',
      });
      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail when username is missing', () => {
      const dto = plainToInstance(LoginDto, {
        password: 'password123',
      });
      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail when password is missing', () => {
      const dto = plainToInstance(LoginDto, {
        username: 'test@example.com',
      });
      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail when username is not a string', () => {
      const dto = plainToInstance(LoginDto, {
        username: 12345,
        password: 'password123',
      });
      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail when password is not a string', () => {
      const dto = plainToInstance(LoginDto, {
        username: 'test@example.com',
        password: 12345,
      });
      const errors = validateSync(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should pass with any non-empty string username', () => {
      const dto = plainToInstance(LoginDto, {
        username: 'user',
        password: 'pass',
      });
      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
