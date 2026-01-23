import type { Message, Client } from 'whatsapp-web.js';

/**
 * Context passed to command handlers
 */
export interface CommandContext {
  message: Message;
  client: Client;
  args: string[];
}

/**
 * Command handler function signature
 */
export type CommandHandler = (ctx: CommandContext) => Promise<void>;

/**
 * Command definition
 */
export interface Command {
  /** Command name (without prefix) */
  name: string;
  /** Command description for help */
  description: string;
  /** Command handler function */
  execute: CommandHandler;
}

/**
 * Media handler function signature
 */
export type MediaHandler = (ctx: CommandContext) => Promise<void>;

/**
 * Media type handler definition
 */
export interface MediaTypeHandler {
  /** Media types this handler supports */
  types: string[];
  /** Handler description */
  description: string;
  /** Handler function */
  execute: MediaHandler;
}

/**
 * Bot configuration
 */
export interface BotConfig {
  /** Gemini API key */
  geminiApiKey: string;
  /** Whitelisted phone numbers */
  whitelistedNumbers: string[];
  /** Command prefix */
  commandPrefix: string;
  /** Node environment */
  nodeEnv: string;
  /** Puppeteer executable path */
  puppeteerPath?: string;
  /** Auth data path */
  authPath: string;
}
