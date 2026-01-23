import { describe, it, expect, beforeAll } from 'vitest';
import { initializeCommands, getCommand, getAllCommands } from './index';

describe('Commands Registry', () => {
  beforeAll(() => {
    initializeCommands();
  });

  describe('getCommand', () => {
    it('should return ping command', () => {
      const command = getCommand('ping');

      expect(command).toBeDefined();
      expect(command?.name).toBe('ping');
    });

    it('should return help command', () => {
      const command = getCommand('help');

      expect(command).toBeDefined();
      expect(command?.name).toBe('help');
    });

    it('should return undefined for unknown command', () => {
      const command = getCommand('unknown');

      expect(command).toBeUndefined();
    });

    it('should be case insensitive', () => {
      const command = getCommand('PING');

      expect(command).toBeDefined();
      expect(command?.name).toBe('ping');
    });
  });

  describe('getAllCommands', () => {
    it('should return all registered commands', () => {
      const commands = getAllCommands();

      expect(commands.length).toBeGreaterThanOrEqual(2);
      expect(commands.map(c => c.name)).toContain('ping');
      expect(commands.map(c => c.name)).toContain('help');
    });
  });
});
