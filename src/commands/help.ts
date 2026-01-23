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

    const helpText = `*Commandes*

${config.commandPrefix}ping - Test de connexion
${config.commandPrefix}help - Affiche cette aide
${config.commandPrefix}details - Analyse approfondie du dernier vocal

*Messages Vocaux*

< 30s : Transcription
30s - 2min : Resume court
> 2min : Resume + points cles

Pour les longs vocaux, tape *!details* apres pour obtenir chronologie + transcription complete.`;

    await client.sendMessage(message.from, helpText, { sendSeen: false });
    console.log('Help sent');
  },
};
