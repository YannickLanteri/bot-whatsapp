import { describe, it, expect } from 'vitest';
import { getMediaHandler, getAllMediaHandlers } from './index';

describe('Media Handlers Registry', () => {
  describe('getMediaHandler', () => {
    it('should return voice handler for audio type', () => {
      const handler = getMediaHandler('audio');

      expect(handler).toBeDefined();
      expect(handler?.types).toContain('audio');
    });

    it('should return voice handler for ptt type', () => {
      const handler = getMediaHandler('ptt');

      expect(handler).toBeDefined();
      expect(handler?.types).toContain('ptt');
    });

    it('should return undefined for unsupported type', () => {
      const handler = getMediaHandler('image');

      expect(handler).toBeUndefined();
    });
  });

  describe('getAllMediaHandlers', () => {
    it('should return all registered handlers', () => {
      const handlers = getAllMediaHandlers();

      expect(handlers.length).toBeGreaterThanOrEqual(1);
    });
  });
});
