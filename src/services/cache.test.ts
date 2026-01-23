import { describe, it, expect, beforeEach } from 'vitest';
import { cacheService } from './cache';

describe('Cache Service', () => {
  const userId = '33612345678@c.us';
  const voiceData = {
    audioData: 'base64data',
    mimeType: 'audio/ogg',
    duration: 60,
    timestamp: Date.now(),
  };

  beforeEach(() => {
    // Clear any existing cache by setting expired data
    (cacheService as any).voiceCache.clear();
  });

  describe('setVoice / getVoice', () => {
    it('should store and retrieve voice data', () => {
      cacheService.setVoice(userId, voiceData);
      const cached = cacheService.getVoice(userId);

      expect(cached).not.toBeNull();
      expect(cached?.audioData).toBe('base64data');
      expect(cached?.duration).toBe(60);
    });

    it('should return null for unknown user', () => {
      const cached = cacheService.getVoice('unknown@c.us');
      expect(cached).toBeNull();
    });

    it('should overwrite previous data for same user', () => {
      cacheService.setVoice(userId, voiceData);
      cacheService.setVoice(userId, { ...voiceData, duration: 120 });

      const cached = cacheService.getVoice(userId);
      expect(cached?.duration).toBe(120);
    });
  });

  describe('hasVoice', () => {
    it('should return true when user has cached voice', () => {
      cacheService.setVoice(userId, voiceData);
      expect(cacheService.hasVoice(userId)).toBe(true);
    });

    it('should return false when user has no cached voice', () => {
      expect(cacheService.hasVoice('unknown@c.us')).toBe(false);
    });
  });

  describe('expiration', () => {
    it('should return null for expired cache', () => {
      const expiredData = {
        ...voiceData,
        timestamp: Date.now() - 31 * 60 * 1000, // 31 minutes ago
      };
      cacheService.setVoice(userId, expiredData);

      const cached = cacheService.getVoice(userId);
      expect(cached).toBeNull();
    });
  });
});
