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
  puppeteerPath: process.env.PUPPETEER_EXECUTABLE_PATH, // Legacy, not used with Baileys
  authPath: path.join(process.cwd(), 'auth_info_baileys'),
};

/**
 * Check if a phone number is whitelisted
 * Baileys uses format: 33612345678@s.whatsapp.net
 * whatsapp-web.js used: 33612345678@c.us
 */
export function isWhitelisted(from: string): boolean {
  // If no whitelist configured, allow all
  if (config.whitelistedNumbers.length === 0) {
    return true;
  }
  
  // Extract number from JID (works with both @s.whatsapp.net and @c.us)
  const number = from.split('@')[0];
  
  return config.whitelistedNumbers.some(num => {
    // Remove any + prefix for comparison
    const cleanNum = num.replace(/^\+/, '');
    return number === cleanNum || number === num;
  });
}

/**
 * Validate required configuration
 */
export function validateConfig(): void {
  if (!config.geminiApiKey) {
    console.warn('Warning: GEMINI_API_KEY is not set. Voice transcription will not work.');
  }

  if (config.whitelistedNumbers.length === 0) {
    console.warn('Warning: No whitelisted numbers configured. Bot will respond to everyone.');
  }
}
