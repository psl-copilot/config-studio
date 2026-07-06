import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken', () => ({
  decode: jest.fn(),
}));

const jwt = require('jsonwebtoken');

jest.mock('@tazama-lf/auth-lib', () => ({
  validateTokenAndClaims: jest.fn(),
}));

import { validateTokenAndClaims } from '@tazama-lf/auth-lib';
import { TazamaAuthGuard } from './tazama-auth.guard';

describe('TazamaAuthGuard', () => {
  let guard: TazamaAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new TazamaAuthGuard(reflector);
    jest.clearAllMocks();
  });

  const createMockContext = (
    headers: Record<string, string> = {},
    ip?: string,
    socket?: { remoteAddress?: string },
  ): ExecutionContext => {
    const request = {
      headers,
      ip,
      socket: socket ?? {},
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({}),
      }),
      getHandler: () => jest.fn(),
      getClass: () => class TestClass {},
    } as unknown as ExecutionContext;
  };

  // Helper to mock reflector for non-public routes with claims
  const mockReflector = (isPublic: boolean, claims: string[] = [], anyClaims: string[] = []) => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === 'isPublic') return isPublic;
      if (key === 'claims') return claims.length > 0 ? claims : undefined;
      if (key === 'anyClaims') return anyClaims.length > 0 ? anyClaims : undefined;
      return undefined;
    });
  };

  describe('canActivate - public routes', () => {
    it('should return true for public routes', () => {
      mockReflector(true);

      const context = createMockContext();
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('canActivate - missing token', () => {
    it('should throw UnauthorizedException when no authorization header', () => {
      mockReflector(false);

      const context = createMockContext({});

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when authorization header does not start with Bearer', () => {
      mockReflector(false);

      const context = createMockContext({ authorization: 'Basic abc123' });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });
  });

  describe('canActivate - with valid token', () => {
    const validToken = 'valid.jwt.token';

    beforeEach(() => {
      (validateTokenAndClaims as jest.Mock).mockReturnValue({
        'config:read': true,
        'config:write': true,
      });
      (jwt.decode as jest.Mock).mockReturnValue({
        tenantId: 'tenant1',
        clientId: 'client1',
        realm_access: { roles: ['editor'] },
        preferred_username: 'user@example.com',
      });
    });

    it('should return true when no claims are required (any authenticated user)', () => {
      mockReflector(false);

      const context = createMockContext({
        authorization: `Bearer ${validToken}`,
      });

      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should return true when all required claims are valid', () => {
      mockReflector(false, ['config:read']);

      const context = createMockContext({
        authorization: `Bearer ${validToken}`,
      });

      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should throw when required claims are missing', () => {
      (validateTokenAndClaims as jest.Mock).mockReturnValue({
        'config:read': false,
      });
      mockReflector(false, ['config:read']);

      const context = createMockContext({
        authorization: `Bearer ${validToken}`,
      });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should return true when any-claims match is found', () => {
      mockReflector(false, [], ['config:read', 'config:admin']);

      const context = createMockContext({
        authorization: `Bearer ${validToken}`,
      });

      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should throw when no any-claims match', () => {
      (validateTokenAndClaims as jest.Mock).mockReturnValue({
        'config:read': false,
        'config:admin': false,
      });
      mockReflector(false, [], ['config:read', 'config:admin']);

      const context = createMockContext({
        authorization: `Bearer ${validToken}`,
      });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should set request.user with authenticated user data', () => {
      mockReflector(false);

      const context = createMockContext({
        authorization: `Bearer ${validToken}`,
      });

      guard.canActivate(context);

      const request = context.switchToHttp().getRequest();
      expect(request.user).toBeDefined();
      expect(request.user.tenantId).toBe('tenant1');
      expect(request.user.userId).toBe('client1');
    });

    it('should extract sourceIP from request.ip', () => {
      mockReflector(false);

      const context = createMockContext(
        { authorization: `Bearer ${validToken}` },
        '192.168.1.1',
      );

      guard.canActivate(context);
      const request = context.switchToHttp().getRequest();
      expect(request.user.sourceIP).toBe('192.168.1.1');
    });

    it('should extract sourceIP from x-forwarded-for header', () => {
      mockReflector(false);

      const context = createMockContext({
        authorization: `Bearer ${validToken}`,
        'x-forwarded-for': '10.0.0.1, 10.0.0.2',
      });

      guard.canActivate(context);
      const request = context.switchToHttp().getRequest();
      expect(request.user.sourceIP).toBe('10.0.0.1');
    });

    it('should extract sourceIP from socket.remoteAddress as fallback', () => {
      mockReflector(false);

      const context = createMockContext(
        { authorization: `Bearer ${validToken}` },
        undefined,
        { remoteAddress: '127.0.0.1' },
      );

      guard.canActivate(context);
      const request = context.switchToHttp().getRequest();
      expect(request.user.sourceIP).toBe('127.0.0.1');
    });
  });

  describe('canActivate - invalid token format', () => {
    it('should throw UnauthorizedException when jwt.decode returns null', () => {
      mockReflector(false);
      (jwt.decode as jest.Mock).mockReturnValue(null);
      (validateTokenAndClaims as jest.Mock).mockReturnValue({});

      const context = createMockContext({
        authorization: 'Bearer invalid-token',
      });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });
  });
});
