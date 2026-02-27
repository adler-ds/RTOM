import { IntegrationService } from '../services/integration.service';
import { GeniusTransaction } from '../types/genius.types';

describe('IntegrationService', () => {
  let integrationService: IntegrationService;

  beforeAll(() => {
    integrationService = new IntegrationService();
  });

  describe('calculatePoints', () => {
    it('should calculate base points correctly', () => {
      const result = integrationService.calculatePoints(10.00);
      expect(result.pointsAwarded).toBe(100);
      expect(result.totalPoints).toBe(100);
    });

    it('should add bonus points for $25+ transactions', () => {
      const result = integrationService.calculatePoints(30.00);
      expect(result.pointsAwarded).toBe(300);
      expect(result.bonusPoints).toBe(25);
      expect(result.totalPoints).toBe(325);
    });

    it('should add larger bonus for $50+ transactions', () => {
      const result = integrationService.calculatePoints(75.00);
      expect(result.pointsAwarded).toBe(750);
      expect(result.bonusPoints).toBe(50);
      expect(result.totalPoints).toBe(800);
    });

    it('should handle decimal amounts correctly', () => {
      const result = integrationService.calculatePoints(12.99);
      expect(result.pointsAwarded).toBe(129);
      expect(result.totalPoints).toBe(129);
    });
  });
});
