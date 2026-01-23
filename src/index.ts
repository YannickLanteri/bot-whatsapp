import { config, validateConfig } from './config';
import { cleanupChromiumLocks } from './services/cleanup';
import { geminiService } from './services/gemini';
import { createWhatsAppClient, setupEventHandlers, setupShutdown } from './client/whatsapp';

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

  // Cleanup Chromium locks (prevents "Profile in use" errors)
  console.log('Cleaning up Chromium locks...');
  cleanupChromiumLocks(config.authPath);

  // Create and configure WhatsApp client
  const client = createWhatsAppClient();
  setupEventHandlers(client);
  setupShutdown(client);

  // Handle unhandled errors
  process.on('unhandledRejection', (reason) => {
    console.error('[ERROR] Unhandled rejection:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('[ERROR] Uncaught exception:', error.message);
  });

  // Start the bot
  console.log('Initializing WhatsApp client...');
  await client.initialize();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
