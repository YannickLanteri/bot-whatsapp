import dotenv from 'dotenv';
import path from 'path';
import type { BotConfig } from '../types';

dotenv.config();

/**
 * Parse whitelisted numbers from environment variable
 */
function parseWhitelistedNumbers(): string[] {
  const numbers = process.env.WHITELISTED_NUMBERS;
  if (!numbers) return [];
  return numbers.split(',').map(n => n.trim()).filter(Boolean);
}

/**
 * Bot configuration loaded from environment variables
 */
export const config: BotConfig = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  whitelistedNumbers: parseWhitelistedNumbers(),
  commandPrefix: process.env.COMMAND_PREFIX || '!',
  nodeEnv: process.env.NODE_ENV || 'development',
  puppeteerPath: process.env.PUPPETEER_EXECUTABLE_PATH,
  authPath: path.join(process.cwd(), '.wwebjs_auth'),
};

/**
 * Check if a phone number is whitelisted
 */
export function isWhitelisted(from: string): boolean {
  return config.whitelistedNumbers.some(num => from === `${num}@c.us`);
}

/**
 * Validate required configuration
 */
export function validateConfig(): void {
  if (!config.geminiApiKey) {
    console.warn('Warning: GEMINI_API_KEY is not set. Voice transcription will not work.');
  }

  if (config.whitelistedNumbers.length === 0) {
    console.warn('Warning: No whitelisted numbers configured. Bot will ignore all messages.');
  }
}
