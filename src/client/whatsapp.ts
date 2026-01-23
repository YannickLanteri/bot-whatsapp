import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { config, isWhitelisted } from '../config';
import { getCommand, initializeCommands } from '../commands';
import { getMediaHandler } from '../handlers';
import type { CommandContext } from '../types';

/**
 * Create and configure the WhatsApp client
 */
export function createWhatsAppClient(): Client {
  const client = new Client({
    authStrategy: new LocalAuth({
      dataPath: '.wwebjs_auth',
    }),
    puppeteer: {
      headless: true,
      executablePath: config.puppeteerPath || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ],
    },
  });

  return client;
}

/**
 * Setup all event handlers for the client
 */
export function setupEventHandlers(client: Client): void {
  initializeCommands();

  client.on('qr', (qr) => {
    console.log('[QR] New QR code generated');

    if (config.nodeEnv !== 'production') {
      qrcode.generate(qr, { small: true });
    }

    console.log('Scan this link to connect:');
    console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
  });

  client.on('authenticated', () => {
    console.log('[AUTH] Authenticated successfully');
  });

  client.on('auth_failure', (msg) => {
    console.error('[AUTH] Authentication failed:', msg);
  });

  client.on('ready', () => {
    console.log('[BOT] Ready and connected');
    console.log(`[BOT] Whitelist: ${config.whitelistedNumbers.join(', ') || 'none'}`);
  });

  client.on('disconnected', (reason) => {
    console.log('[BOT] Disconnected:', reason);
  });

  client.on('message', async (message) => {
    const preview = message.body.substring(0, 50);
    console.log(`[MSG] ${message.from}: "${preview}${message.body.length > 50 ? '...' : ''}"`);

    if (!isWhitelisted(message.from)) {
      console.log('[MSG] Not whitelisted, ignoring');
      return;
    }

    const ctx: CommandContext = {
      message,
      client,
      args: [],
    };

    try {
      // Check for commands
      if (message.body.startsWith(config.commandPrefix)) {
        const parts = message.body.slice(config.commandPrefix.length).trim().split(/\s+/);
        const commandName = parts[0];
        const args = parts.slice(1);

        const command = getCommand(commandName);
        if (command) {
          ctx.args = args;
          await command.execute(ctx);
          return;
        }
      }

      // Check for media
      if (message.hasMedia) {
        const handler = getMediaHandler(message.type);
        if (handler) {
          await handler.execute(ctx);
          return;
        }
      }
    } catch (error) {
      const err = error as Error;
      console.error('[ERROR]', err.message);
    }
  });
}

/**
 * Setup graceful shutdown handlers
 */
export function setupShutdown(client: Client): void {
  const shutdown = async (signal: string) => {
    console.log(`[SYS] ${signal} received. Shutting down...`);
    try {
      await client.destroy();
      console.log('[SYS] Bot closed cleanly');
      process.exit(0);
    } catch (err) {
      const error = err as Error;
      console.error('[SYS] Error during shutdown:', error.message);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}
