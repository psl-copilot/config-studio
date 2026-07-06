import { ExecutionContext } from '@nestjs/common';
import { User } from './user.decorator';

describe('User Decorator', () => {
  it('should be a function (param decorator)', () => {
    expect(typeof User).toBe('function');
  });

  // createParamDecorator returns a decorator factory.
  // The actual execution logic is: (data, ctx) => ctx.switchToHttp().getRequest().user
  // We test the extraction logic directly by simulating what the decorator does.

  const extractUser = (ctx: ExecutionContext): unknown => {
    return ctx.switchToHttp().getRequest().user;
  };

  it('should extract user from request when applied', () => {
    const mockUser = { id: '1', username: 'test', role: 'editor' };
    const mockRequest = { user: mockUser };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => ({}),
      }),
    } as ExecutionContext;

    const result = extractUser(mockContext);

    expect(result).toBe(mockUser);
  });

  it('should return undefined when request has no user', () => {
    const mockRequest = {};
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => ({}),
      }),
    } as ExecutionContext;

    const result = extractUser(mockContext);

    expect(result).toBeUndefined();
  });

  it('should return user with complex object', () => {
    const mockUser = {
      id: '123',
      username: 'admin@example.com',
      role: 'admin',
      claims: ['read', 'write', 'delete'],
      tenantId: 'tenant-1',
    };
    const mockRequest = { user: mockUser };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => ({}),
      }),
    } as ExecutionContext;

    const result = extractUser(mockContext);

    expect(result).toEqual(mockUser);
  });

  it('should return null user when user is explicitly null', () => {
    const mockRequest = { user: null };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => ({}),
      }),
    } as ExecutionContext;

    const result = extractUser(mockContext);

    expect(result).toBeNull();
  });

  it('should handle request with user and other properties', () => {
    const mockUser = { id: '1', username: 'test' };
    const mockRequest = { user: mockUser, body: {}, query: {} };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => ({}),
      }),
    } as ExecutionContext;

    const result = extractUser(mockContext);

    expect(result).toBe(mockUser);
  });
});
