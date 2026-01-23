import { describe, it, expect, vi } from 'vitest';
import { pingCommand } from './ping';
import type { CommandContext } from '../types';

describe('Ping Command', () => {
  it('should have correct name and description', () => {
    expect(pingCommand.name).toBe('ping');
    expect(pingCommand.description).toBeDefined();
  });

  it('should send pong message when executed', async () => {
    const sendMessage = vi.fn().mockResolvedValue(undefined);

    const ctx: CommandContext = {
      message: { from: '33612345678@c.us' } as any,
      client: { sendMessage } as any,
      args: [],
    };

    await pingCommand.execute(ctx);

    expect(sendMessage).toHaveBeenCalledWith(
      '33612345678@c.us',
      'pong',
      { sendSeen: false }
    );
  });
});
