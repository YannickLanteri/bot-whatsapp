import type { MediaTypeHandler } from '../types';
import { geminiService } from '../services/gemini';

/**
 * Voice message handler
 * Analyzes voice notes using Gemini AI
 */
export const voiceHandler: MediaTypeHandler = {
  types: ['audio', 'ptt'],
  description: 'Analyze voice messages with AI',

  async execute({ message, client }) {
    console.log('Processing voice message...');

    if (!geminiService.isAvailable()) {
      await client.sendMessage(
        message.from,
        'Voice analysis is not configured. Please set GEMINI_API_KEY.',
        { sendSeen: false }
      );
      return;
    }

    await client.sendMessage(message.from, 'Analyzing...', { sendSeen: false });

    const media = await message.downloadMedia();
    if (!media) {
      await client.sendMessage(message.from, 'Failed to download audio', { sendSeen: false });
      return;
    }

    try {
      const analysis = await geminiService.analyzeAudio(media.data, media.mimetype);

      const formattedResponse = `*VOICE ANALYSIS*

${analysis}`;

      await client.sendMessage(message.from, formattedResponse, { sendSeen: false });
      console.log('Analysis sent');
    } catch (error) {
      const err = error as Error;
      console.error('Gemini error:', err.message);
      await client.sendMessage(
        message.from,
        'Error analyzing audio. Please try again.',
        { sendSeen: false }
      );
    }
  },
};
