import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupFetch401Interceptor } from './interceptor';

describe('interceptor', () => {
  let originalFetch: typeof window.fetch;
  let mockFetch: ReturnType<typeof vi.fn>;
  let mockNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    originalFetch = window.fetch;
    mockFetch = vi.fn();
    mockNavigate = vi.fn();
    window.fetch = mockFetch as unknown as typeof window.fetch;
  });

  afterEach(() => {
    window.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('setupFetch401Interceptor', () => {
    it('should be a function', () => {
      expect(typeof setupFetch401Interceptor).toBe('function');
    });

    it('should override window.fetch', () => {
      const original = window.fetch;
      setupFetch401Interceptor(mockNavigate);
      expect(window.fetch).not.toBe(original);
    });

    it('should call navigateToLogin after delay when response status is 401', async () => {
      vi.useFakeTimers();
      mockFetch.mockResolvedValue({
        status: 401,
        ok: false,
        json: () => Promise.resolve({}),
      });

      setupFetch401Interceptor(mockNavigate);
      await window.fetch('http://test.com/api');

      vi.advanceTimersByTime(2000);
      expect(mockNavigate).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('should not call navigateToLogin when response status is 200', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve({}),
      });

      setupFetch401Interceptor(mockNavigate);
      await window.fetch('http://test.com/api');

      // Wait a bit to ensure no navigation
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not call navigateToLogin when response status is 500', async () => {
      mockFetch.mockResolvedValue({
        status: 500,
        ok: false,
        json: () => Promise.resolve({}),
      });

      setupFetch401Interceptor(mockNavigate);
      await window.fetch('http://test.com/api');

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should return the response for non-401 status', async () => {
      const mockResponse = { status: 200, ok: true, json: () => Promise.resolve({ data: 'test' }) };
      mockFetch.mockResolvedValue(mockResponse);

      setupFetch401Interceptor(mockNavigate);
      const response = await window.fetch('http://test.com/api');

      expect(response).toBe(mockResponse);
    });

    it('should return the response even for 401 status', async () => {
      vi.useFakeTimers();
      const mockResponse = { status: 401, ok: false, json: () => Promise.resolve({}) };
      mockFetch.mockResolvedValue(mockResponse);

      setupFetch401Interceptor(mockNavigate);
      const response = await window.fetch('http://test.com/api');

      expect(response).toBe(mockResponse);
      vi.useRealTimers();
    });

    it('should pass input and init to original fetch', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve({}),
      });

      setupFetch401Interceptor(mockNavigate);
      const init = { method: 'POST', headers: { 'Content-Type': 'application/json' } };
      await window.fetch('http://test.com/api', init);

      expect(mockFetch).toHaveBeenCalledWith('http://test.com/api', init);
    });

    it('should pass default empty init when not provided', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve({}),
      });

      setupFetch401Interceptor(mockNavigate);
      await window.fetch('http://test.com/api');

      expect(mockFetch).toHaveBeenCalledWith('http://test.com/api', {});
    });
  });
});
