import type { Command } from '../types';
import { config } from '../config';

/**
 * Help command - List available commands
 * Usage: !help
 */
export const helpCommand: Command = {
  name: 'help',
  description: 'Display available commands',

  async execute({ message, client }) {
    console.log('Command: !help');

    const helpText = `*Available Commands*

${config.commandPrefix}ping - Health check
${config.commandPrefix}help - Show this help message

*Voice Messages*
Send a voice note and I'll analyze it with AI, providing:
- Summary
- Timeline (if > 1 min)
- Key points
- Action items`;

    await client.sendMessage(message.from, helpText, { sendSeen: false });
    console.log('Help sent');
  },
};
