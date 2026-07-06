import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHello', () => {
    it('should return "Up!"', () => {
      const result = service.getHello();
      expect(result).toBe('Up!');
    });

    it('should always return a string', () => {
      const result = service.getHello();
      expect(typeof result).toBe('string');
    });

    it('should return a non-empty string', () => {
      const result = service.getHello();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
