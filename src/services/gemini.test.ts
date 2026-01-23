import { describe, it, expect } from 'vitest';
import { geminiService, DURATION_THRESHOLDS } from './gemini';

describe('Gemini Service', () => {
  describe('getAnalysisType', () => {
    it('should return transcription for < 30s', () => {
      expect(geminiService.getAnalysisType(0)).toBe('transcription');
      expect(geminiService.getAnalysisType(15)).toBe('transcription');
      expect(geminiService.getAnalysisType(29)).toBe('transcription');
    });

    it('should return short for 30s - 2min', () => {
      expect(geminiService.getAnalysisType(30)).toBe('short');
      expect(geminiService.getAnalysisType(60)).toBe('short');
      expect(geminiService.getAnalysisType(119)).toBe('short');
    });

    it('should return full for > 2min', () => {
      expect(geminiService.getAnalysisType(120)).toBe('full');
      expect(geminiService.getAnalysisType(180)).toBe('full');
      expect(geminiService.getAnalysisType(300)).toBe('full');
    });
  });

  describe('DURATION_THRESHOLDS', () => {
    it('should have correct threshold values', () => {
      expect(DURATION_THRESHOLDS.SHORT).toBe(30);
      expect(DURATION_THRESHOLDS.MEDIUM).toBe(120);
    });
  });

  describe('isAvailable', () => {
    it('should return false when not initialized', () => {
      // By default, without GEMINI_API_KEY, it should not be available
      expect(geminiService.isAvailable()).toBe(false);
    });
  });
});
