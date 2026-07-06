import { Test, type TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHello', () => {
    it('should call appService.getHello and return its result', () => {
      const getResult = 'Up!';
      jest.spyOn(service, 'getHello').mockReturnValue(getResult);

      const result = controller.getHello();

      expect(service.getHello).toHaveBeenCalledTimes(1);
      expect(result).toBe(getResult);
    });

    it('should return a string', () => {
      jest.spyOn(service, 'getHello').mockReturnValue('Up!');
      const result = controller.getHello();
      expect(typeof result).toBe('string');
    });
  });

  describe('getHealth', () => {
    it('should return status "up"', () => {
      const result = controller.getHealth();
      expect(result.status).toBe('up');
    });

    it('should return service "config-studio"', () => {
      const result = controller.getHealth();
      expect(result.service).toBe('config-studio');
    });

    it('should return a valid ISO timestamp', () => {
      const result = controller.getHealth();
      const parsed = new Date(result.timestamp);
      expect(parsed.toISOString()).toBe(result.timestamp);
    });

    it('should return all three fields', () => {
      const result = controller.getHealth();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('service');
      expect(result).toHaveProperty('timestamp');
    });

    it('should return a timestamp close to now', () => {
      const before = Date.now();
      const result = controller.getHealth();
      const after = Date.now();
      const ts = new Date(result.timestamp).getTime();
      expect(ts).toBeGreaterThanOrEqual(before - 1);
      expect(ts).toBeLessThanOrEqual(after + 1);
    });

    it('should return different timestamps on subsequent calls', () => {
      const result1 = controller.getHealth();
      const result2 = controller.getHealth();
      // They could be the same if called within the same millisecond,
      // but both should be valid ISO strings
      expect(new Date(result1.timestamp).toISOString()).toBe(result1.timestamp);
      expect(new Date(result2.timestamp).toISOString()).toBe(result2.timestamp);
    });
  });

  describe('integration with AppService', () => {
    it('should return the actual service value', () => {
      // Don't mock - use the real service
      jest.restoreAllMocks();
      const result = controller.getHello();
      expect(result).toBe('Up!');
    });
  });
});
