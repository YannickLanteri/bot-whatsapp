import type { MediaTypeHandler } from '../types';
import { geminiService } from '../services/gemini';
import { setUserState, getUserState } from '../services/userState';

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
 * Shows interactive menu for user to choose action
 */
export const voiceHandler: MediaTypeHandler = {
  types: ['audio', 'ptt'],
  description: 'Handle voice messages with interactive menu',

  async execute({ message, client }) {
    console.log('Processing voice message...');

    if (!geminiService.isAvailable()) {
      await client.sendMessage(
        message.from,
        '❌ Service non configuré. Contacte l\'admin.'
      );
      return;
    }

    // Get audio duration
    const duration = (message as any).duration || 0;
    console.log(`Voice duration: ${duration}s`);

    // Download and cache the media
    const media = await message.downloadMedia();
    if (!media) {
      await client.sendMessage(message.from, '❌ Échec du téléchargement');
      return;
    }

    // Cache the voice message and set pending action
    setUserState(message.from, {
      pendingAction: 'voice_menu',
      cachedVoice: {
        data: media.data,
        mimetype: media.mimetype,
        duration,
        timestamp: Date.now(),
      },
    });

    // Send interactive menu
    const menu = `🎙️ *Vocal reçu* (${formatDuration(duration)})

Que veux-tu faire ?

1️⃣ Transcription complète
2️⃣ Résumé rapide
3️⃣ Les deux (transcription + résumé)
4️⃣ Points d'action (todos)

_Réponds avec le numéro de ton choix_`;

    await client.sendMessage(message.from, menu);
    console.log('Voice menu sent, waiting for user choice');
  },
};

/**
 * Process user's voice menu choice
 */
export async function processVoiceChoice(
  jid: string,
  choice: string,
  sendMessage: (to: string, content: string) => Promise<void>
): Promise<boolean> {
  const state = getUserState(jid);
  
  if (state.pendingAction !== 'voice_menu' || !state.cachedVoice) {
    return false;
  }

  const { data, mimetype, duration } = state.cachedVoice;
  let analysisType: 'transcription' | 'short' | 'full' | 'details' | 'todos';
  let responsePrefix: string;

  switch (choice) {
    case '1':
      analysisType = 'transcription';
      responsePrefix = '📝 *TRANSCRIPTION*';
      break;
    case '2':
      analysisType = 'short';
      responsePrefix = '📋 *RÉSUMÉ*';
      break;
    case '3':
      analysisType = 'full';
      responsePrefix = '📝 *TRANSCRIPTION + RÉSUMÉ*';
      break;
    case '4':
      analysisType = 'todos';
      responsePrefix = '✅ *POINTS D\'ACTION*';
      break;
    default:
      return false;
  }

  await sendMessage(jid, '⏳ Analyse en cours...');

  try {
    const analysis = await geminiService.analyzeAudio(data, mimetype, analysisType);
    
    const durationStr = duration ? ` (${formatDuration(duration)})` : '';
    await sendMessage(jid, `${responsePrefix}${durationStr}\n\n${analysis}`);
    
    console.log(`Voice analysis sent (type: ${analysisType})`);
  } catch (error) {
    console.error('Gemini error:', (error as Error).message);
    await sendMessage(jid, '❌ Erreur lors de l\'analyse. Réessaie.');
  }

  return true;
}
