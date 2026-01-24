import { GoogleGenAI } from '@google/genai';
import { config } from '../config';

export type AnalysisType = 'transcription' | 'short' | 'full' | 'details';

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

  full: `Analyze this voice note and create a summary in FRENCH.

Format your response EXACTLY like this:

*RESUME*
(One clear sentence summarizing the entire message)

*POINTS CLES*
• Point 1
• Point 2
• Point 3

*ACTIONS*
• Action 1
• Action 2
(Skip this section if no action items)

Keep it concise. User can request more details with !details command.`,

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
