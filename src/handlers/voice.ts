import type { MediaTypeHandler } from '../types';
import { geminiService, DURATION_THRESHOLDS } from '../services/gemini';
import { cacheService } from '../services/cache';

/**
 * Format duration in mm:ss
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Voice message handler
 * Analyzes voice notes using Gemini AI with adaptive response based on duration
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

    // Get audio duration (whatsapp-web.js provides this for voice messages)
    const duration = (message as any).duration || 0;
    console.log(`Voice duration: ${duration}s`);

    await client.sendMessage(message.from, 'Analyse en cours...', { sendSeen: false });

    const media = await message.downloadMedia();
    if (!media) {
      await client.sendMessage(message.from, 'Echec du telechargement', { sendSeen: false });
      return;
    }

    try {
      // Determine analysis type based on duration
      const analysisType = geminiService.getAnalysisType(duration);
      console.log(`Analysis type: ${analysisType} (duration: ${duration}s)`);

      // Cache voice data for potential !details request
      cacheService.setVoice(message.from, {
        audioData: media.data,
        mimeType: media.mimetype,
        duration,
        timestamp: Date.now(),
      });

      // Perform analysis
      const analysis = await geminiService.analyzeAudio(media.data, media.mimetype, analysisType);

      // Format response based on type
      let response: string;

      if (analysisType === 'transcription') {
        response = `*TRANSCRIPTION* (${formatDuration(duration)})

${analysis}`;
      } else if (analysisType === 'short') {
        response = `*ANALYSE VOCALE* (${formatDuration(duration)})

${analysis}`;
      } else {
        // Full analysis - mention !details option
        response = `*ANALYSE VOCALE* (${formatDuration(duration)})

${analysis}

_Tape *!details* pour une analyse approfondie_`;
      }

      await client.sendMessage(message.from, response, { sendSeen: false });
      console.log(`Analysis sent (type: ${analysisType})`);
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
