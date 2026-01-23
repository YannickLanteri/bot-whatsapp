/**
 * Simple in-memory cache for storing last voice analysis per user
 */

export interface VoiceCache {
  audioData: string;
  mimeType: string;
  duration: number;
  timestamp: number;
}

class CacheService {
  private voiceCache: Map<string, VoiceCache> = new Map();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  /**
   * Store voice data for a user
   */
  setVoice(userId: string, data: VoiceCache): void {
    this.voiceCache.set(userId, data);
    this.cleanup();
  }

  /**
   * Get cached voice data for a user
   */
  getVoice(userId: string): VoiceCache | null {
    const cached = this.voiceCache.get(userId);
    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.voiceCache.delete(userId);
      return null;
    }

    return cached;
  }

  /**
   * Check if user has cached voice
   */
  hasVoice(userId: string): boolean {
    return this.getVoice(userId) !== null;
  }

  /**
   * Clear expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [userId, data] of this.voiceCache.entries()) {
      if (now - data.timestamp > this.CACHE_TTL) {
        this.voiceCache.delete(userId);
      }
    }
  }
}

export const cacheService = new CacheService();
