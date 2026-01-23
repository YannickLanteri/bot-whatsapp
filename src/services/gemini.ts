import { GoogleGenAI } from '@google/genai';
import { config } from '../config';

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
   * Analyze audio content and return a summary
   */
  async analyzeAudio(audioData: string, mimeType: string): Promise<string> {
    if (!this.ai) {
      throw new Error('Gemini AI service not initialized');
    }

    const prompt = `Analyze this voice note.

Create a high-quality summary in FRENCH.

If the audio is long (more than 1 minute), provide a minute-by-minute timeline.

Extract key takeaways and action items.

Format your response EXACTLY like this (keep the emojis and structure):

RESUME :
(One sentence synthesis of the entire message)

CHRONOLOGIE :
[0:00 - 1:00] : ...
[1:00 - 2:00] : ...
(Skip this section if audio is less than 1 minute)

POINTS CLES :
Point 1
Point 2
Point 3

ACTIONS :
Action item 1
Action item 2
(Skip this section if no action items)`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.0-flash',
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
