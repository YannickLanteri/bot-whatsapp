import type { Command } from '../types';
import { geminiService } from '../services/gemini';
import { cacheService } from '../services/cache';

/**
 * Details command - Get detailed analysis of last voice message
 * Usage: !details
 */
export const detailsCommand: Command = {
  name: 'details',
  description: 'Get detailed analysis of your last voice message',

  async execute({ message, client }) {
    console.log('Command: !details');

    // Check if Gemini is available
    if (!geminiService.isAvailable()) {
      await client.sendMessage(
        message.from,
        'Service d\'analyse non disponible.',
        { sendSeen: false }
      );
      return;
    }

    // Check if user has cached voice
    const cached = cacheService.getVoice(message.from);
    if (!cached) {
      await client.sendMessage(
        message.from,
        'Aucun vocal en memoire. Envoie un vocal d\'abord.',
        { sendSeen: false }
      );
      return;
    }

    await client.sendMessage(message.from, 'Analyse detaillee en cours...', { sendSeen: false });

    try {
      const analysis = await geminiService.analyzeAudio(
        cached.audioData,
        cached.mimeType,
        'details'
      );

      const response = `*ANALYSE DETAILLEE*

${analysis}`;

      await client.sendMessage(message.from, response, { sendSeen: false });
      console.log('Detailed analysis sent');
    } catch (error) {
      const err = error as Error;
      console.error('Gemini error:', err.message);
      await client.sendMessage(
        message.from,
        'Erreur lors de l\'analyse. Reessaie.',
        { sendSeen: false }
      );
    }
  },
};
