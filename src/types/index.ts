/**
 * Context passed to command handlers
 * Compatible with both whatsapp-web.js (legacy) and Baileys
 */
export interface CommandContext {
  message: BotMessage;
  client: BotClient;
  args: string[];
}

/**
 * Abstracted message interface (works with Baileys)
 */
export interface BotMessage {
  /** Sender JID (e.g., 33612345678@s.whatsapp.net) */
  from: string;
  /** Text content of the message */
  body: string;
  /** Message type (conversation, audioMessage, imageMessage, etc.) */
  type: string;
  /** Whether message contains media */
  hasMedia: boolean;
  /** Duration in seconds (for audio messages) */
  duration?: number;
  /** Download media function */
  downloadMedia: () => Promise<{ data: string; mimetype: string } | null>;
  /** Raw message object for advanced usage */
  _raw?: any;
}

/**
 * Abstracted client interface (works with Baileys)
 */
export interface BotClient {
  /** Send a text message */
  sendMessage: (to: string, content: string) => Promise<void>;
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
  /** Puppeteer executable path (legacy, not used with Baileys) */
  puppeteerPath?: string;
  /** Auth data path */
  authPath: string;
}
