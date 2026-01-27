import { GoogleGenAI } from '@google/genai';
import { config } from '../config';

export type AnalysisType = 'transcription' | 'short' | 'full' | 'details' | 'todos' | 'translate';

/**
 * Duration thresholds in seconds
 */
export const DURATION_THRESHOLDS = {
  SHORT: 30,    // < 30s = transcription only
  MEDIUM: 120,  // 30s - 2min = short summary
  // > 2min = full summary with !details option
};

const PROMPTS: Record<AnalysisType, string> = {
  transcription: `Transcribe this voice note word for word in FRENCH.
Keep the exact words spoken, with minimal formatting.
Just return the transcription, nothing else.`,

  short: `Analyze this voice note and create a SHORT summary in FRENCH.

Format your response EXACTLY like this:

*RESUME*
(2-3 sentences maximum summarizing the key message)

*POINTS CLES*
• Point 1
• Point 2
• Point 3
(maximum 3-4 points)`,

  full: `Analyze this voice note in FRENCH.

Provide BOTH transcription and summary:

*TRANSCRIPTION*
(Word for word transcription)

*RESUME*
(2-3 sentences summarizing the key message)

*POINTS CLES*
• Point 1
• Point 2
• Point 3`,

  details: `Analyze this voice note IN DEPTH in FRENCH.

Format your response EXACTLY like this:

*RESUME DETAILLE*
(Detailed 3-4 sentence summary)

*CHRONOLOGIE*
[0:00 - 0:30] : ...
[0:30 - 1:00] : ...
[1:00 - 1:30] : ...
(Continue for each 30-second segment)

*POINTS CLES*
• Point 1 - with explanation
• Point 2 - with explanation
• Point 3 - with explanation
(Be thorough)

*ACTIONS*
• Action 1 - deadline/priority if mentioned
• Action 2 - deadline/priority if mentioned

*TRANSCRIPTION*
(Full word-for-word transcription)`,

  todos: `Extract ALL action items, tasks, and things to do from this voice note.
Respond in FRENCH.

Format your response EXACTLY like this:

*ACTIONS À FAIRE*
☐ Action 1 - deadline if mentioned
☐ Action 2 - who should do it if mentioned
☐ Action 3
(List ALL todos, tasks, reminders, things to do, follow-ups)

*RAPPELS*
• Any important dates or deadlines mentioned
• Things to not forget

If no action items found, say "Aucune action identifiée dans ce message."`,

  translate: `Listen to this voice note and:
1. Detect the language spoken
2. Transcribe it in the original language
3. Translate it to French (if not already French) or to English (if already French)

Format your response EXACTLY like this:

*LANGUE DÉTECTÉE*
[Language name]

*TRANSCRIPTION ORIGINALE*
[Word for word transcription in original language]

*TRADUCTION*
[Translation to French or English]

If the audio is already in French, translate to English. Otherwise translate to French.`,
};

/**
 * Gemini AI service for audio analysis
 */
class GeminiService {
  private ai: GoogleGenAI | null = null;

  /**
   * Initialize the Gemini client
   */
  initialize(): void {
    if (!config.geminiApiKey) {
      console.warn('Gemini API key not configured. Audio analysis disabled.');
      return;
    }
    this.ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
    console.log('Gemini AI service initialized');
  }

  /**
   * Check if Gemini is available
   */
  isAvailable(): boolean {
    return this.ai !== null;
  }

  /**
   * Determine analysis type based on duration
   */
  getAnalysisType(durationSeconds: number): AnalysisType {
    if (durationSeconds < DURATION_THRESHOLDS.SHORT) {
      return 'transcription';
    } else if (durationSeconds < DURATION_THRESHOLDS.MEDIUM) {
      return 'short';
    } else {
      return 'full';
    }
  }

  /**
   * Analyze audio content with specified analysis type
   */
  async analyzeAudio(
    audioData: string,
    mimeType: string,
    type: AnalysisType = 'full'
  ): Promise<string> {
    if (!this.ai) {
      throw new Error('Gemini AI service not initialized');
    }

    const prompt = PROMPTS[type];

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { text: prompt },
        {
          inlineData: {
            data: audioData,
            mimeType: mimeType,
          },
        },
      ],
    });

    return response.text || 'Unable to analyze audio';
  }
}

export const geminiService = new GeminiService();
