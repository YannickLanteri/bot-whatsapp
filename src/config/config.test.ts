import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Config', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  describe('isWhitelisted', () => {
    it('should return true for whitelisted number', async () => {
      vi.stubEnv('WHITELISTED_NUMBERS', '33612345678,33698765432');
      const { isWhitelisted } = await import('./index');

      expect(isWhitelisted('33612345678@c.us')).toBe(true);
      expect(isWhitelisted('33698765432@c.us')).toBe(true);
    });

    it('should return false for non-whitelisted number', async () => {
      vi.stubEnv('WHITELISTED_NUMBERS', '33612345678');
      const { isWhitelisted } = await import('./index');

      expect(isWhitelisted('33699999999@c.us')).toBe(false);
    });

    it('should return false when no numbers are whitelisted', async () => {
      vi.stubEnv('WHITELISTED_NUMBERS', '');
      const { isWhitelisted } = await import('./index');

      expect(isWhitelisted('33612345678@c.us')).toBe(false);
    });

    it('should handle whitespace in number list', async () => {
      vi.stubEnv('WHITELISTED_NUMBERS', '33612345678 , 33698765432');
      const { isWhitelisted } = await import('./index');

      expect(isWhitelisted('33612345678@c.us')).toBe(true);
      expect(isWhitelisted('33698765432@c.us')).toBe(true);
    });
  });

  describe('config object', () => {
    it('should have default command prefix', async () => {
      vi.stubEnv('COMMAND_PREFIX', '');
      const { config } = await import('./index');

      expect(config.commandPrefix).toBe('!');
    });

    it('should use custom command prefix from env', async () => {
      vi.stubEnv('COMMAND_PREFIX', '/');
      const { config } = await import('./index');

      expect(config.commandPrefix).toBe('/');
    });
  });
});
