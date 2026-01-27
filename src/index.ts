import { config, validateConfig } from './config';
import { geminiService } from './services/gemini';
import { createBaileysClient, setupConnectionHandler, setupMessageHandler, shutdown } from './client/baileys';

/**
 * Main entry point
 */
async function main(): Promise<void> {
  console.log('Bot starting...');

  // Validate configuration
  validateConfig();
  console.log(`Whitelisted numbers: ${config.whitelistedNumbers.join(', ') || 'none'}`);

  // Initialize services
  geminiService.initialize();

  // Create and configure Baileys client
  console.log('Initializing WhatsApp client (Baileys)...');
  const sock = await createBaileysClient();
  setupConnectionHandler(sock);
  setupMessageHandler(sock);

  // Handle unhandled errors
  process.on('unhandledRejection', (reason) => {
    console.error('[ERROR] Unhandled rejection:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('[ERROR] Uncaught exception:', error.message);
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    console.log(`[SYS] ${signal} received. Shutting down...`);
    await shutdown();
    process.exit(0);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  console.log('[BOT] Waiting for QR code or auto-reconnect...');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
