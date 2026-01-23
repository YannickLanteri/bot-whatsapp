import type { Command } from '../types';

/**
 * Ping command - Simple health check
 * Usage: !ping
 */
export const pingCommand: Command = {
  name: 'ping',
  description: 'Health check - responds with pong',

  async execute({ message, client }) {
    console.log('Command: !ping');
    await client.sendMessage(message.from, 'pong', { sendSeen: true });
    console.log('Pong sent');
  },
};
