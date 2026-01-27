import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  downloadMediaMessage,
  getContentType,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { config, isWhitelisted } from '../config';
import { getCommand, initializeCommands } from '../commands';
import { getMediaHandler } from '../handlers';
import type { CommandContext, BotMessage, BotClient } from '../types';

// Suppress Baileys verbose logging
const logger = pino({ level: 'silent' });

let sock: WASocket | null = null;

/**
 * Initialize and connect the Baileys WhatsApp client
 */
export async function createBaileysClient(): Promise<WASocket> {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');

  sock = makeWASocket({
    auth: state,
    logger,
    browser: ['Bot WhatsApp', 'Chrome', '120.0.0'],
  });

  // Save credentials on update
  sock.ev.on('creds.update', saveCreds);

  return sock;
}

/**
 * Setup connection event handlers
 */
export function setupConnectionHandler(socket: WASocket): void {
  socket.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('[QR] Scanne ce lien pour te connecter :');
      console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
    }

    if (connection === 'close') {
      const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = reason !== DisconnectReason.loggedOut;

      console.log(`[BOT] Connection closed. Reason: ${DisconnectReason[reason] || reason}`);

      if (shouldReconnect) {
        console.log('[BOT] Reconnecting...');
        const newSock = await createBaileysClient();
        setupConnectionHandler(newSock);
        setupMessageHandler(newSock);
      } else {
        console.log('[BOT] Logged out. Delete ./auth_info_baileys and restart to re-login.');
      }
    }

    if (connection === 'open') {
      console.log('[BOT] Connected to WhatsApp!');
      console.log(`[BOT] Whitelist: ${config.whitelistedNumbers.join(', ') || 'none'}`);
    }
  });
}

/**
 * Extract sender number from JID
 */
function getSenderNumber(jid: string): string {
  return jid.split('@')[0];
}

/**
 * Download media from message
 */
async function downloadMedia(message: any): Promise<{ data: string; mimetype: string } | null> {
  try {
    if (!sock) return null;
    
    const buffer = await downloadMediaMessage(
      message,
      'buffer',
      {},
      { logger, reuploadRequest: sock.updateMediaMessage }
    );

    if (!buffer) return null;

    const messageContent = message.message;
    if (!messageContent) return null;

    const contentType = getContentType(messageContent);
    let mimetype = 'application/octet-stream';

    if (contentType && (messageContent as any)[contentType]) {
      const content = (messageContent as any)[contentType];
      mimetype = content.mimetype || mimetype;
    }

    return {
      data: (buffer as Buffer).toString('base64'),
      mimetype,
    };
  } catch (error) {
    console.error('[MEDIA] Download error:', (error as Error).message);
    return null;
  }
}

/**
 * Get audio duration from message
 */
function getAudioDuration(message: any): number {
  const content = message.message;
  if (!content) return 0;

  const audioMessage = content.audioMessage;
  if (audioMessage?.seconds) {
    return audioMessage.seconds;
  }

  return 0;
}

/**
 * Setup message event handlers
 */
export function setupMessageHandler(socket: WASocket): void {
  initializeCommands();

  socket.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message) continue;

      // Get JID - Baileys v7 uses LID format, remoteJidAlt has real phone number
      const jid = msg.key.remoteJid;
      const jidAlt = (msg.key as any).remoteJidAlt; // Real phone number if available
      
      if (!jid || jid === 'status@broadcast') continue;
      if (msg.key.fromMe) continue;

      // Use alternative JID (real phone) if available, otherwise use primary JID
      const effectiveJid = jidAlt || jid;
      const senderNumber = getSenderNumber(effectiveJid);
      const messageContent = msg.message;
      const contentType = getContentType(messageContent);

      // Get text content
      let textBody = '';
      if (contentType === 'conversation') {
        textBody = messageContent.conversation || '';
      } else if (contentType === 'extendedTextMessage') {
        textBody = messageContent.extendedTextMessage?.text || '';
      }

      const preview = textBody.substring(0, 50);
      // Log both JIDs for debugging
      const jidInfo = jidAlt ? `${senderNumber} (LID: ${getSenderNumber(jid)})` : senderNumber;
      console.log(`[MSG] ${jidInfo}: "${preview}${textBody.length > 50 ? '...' : ''}" (${contentType})`);

      if (!isWhitelisted(effectiveJid)) {
        console.log('[MSG] Not whitelisted, ignoring');
        continue;
      }

      // Check if message has media
      const hasMedia = ['audioMessage', 'imageMessage', 'videoMessage', 'documentMessage', 'stickerMessage'].includes(contentType || '');
      
      // Map content type to handler type
      let mediaType = 'unknown';
      if (contentType === 'audioMessage') {
        const audioMsg = messageContent.audioMessage;
        mediaType = audioMsg?.ptt ? 'ptt' : 'audio';
      } else if (contentType === 'imageMessage') {
        mediaType = 'image';
      }

      // Create abstracted message
      // Use original JID for sending replies (Baileys needs it)
      const botMessage: BotMessage = {
        from: jid,
        body: textBody,
        type: mediaType,
        hasMedia,
        duration: getAudioDuration(msg),
        downloadMedia: async () => downloadMedia(msg),
        _raw: msg,
      };

      // Create abstracted client
      const botClient: BotClient = {
        sendMessage: async (to: string, content: string) => {
          await socket.sendMessage(to, { text: content });
        },
      };

      const ctx: CommandContext = {
        message: botMessage,
        client: botClient,
        args: [],
      };

      try {
        // Check for pending menu actions (1, 2, 3, 4 responses)
        if (textBody.match(/^[1-4]$/)) {
          const { hasPendingAction, getPendingAction, clearUserState } = await import('../services/userState');
          
          if (hasPendingAction(jid)) {
            const pendingAction = getPendingAction(jid);
            
            if (pendingAction === 'voice_menu') {
              const { processVoiceChoice } = await import('../handlers/voice');
              const handled = await processVoiceChoice(jid, textBody, botClient.sendMessage);
              if (handled) {
                clearUserState(jid);
                continue;
              }
            }
            // Future: handle image_menu, contact_confirm here
          }
        }

        // Check for commands
        if (textBody.startsWith(config.commandPrefix)) {
          const parts = textBody.slice(config.commandPrefix.length).trim().split(/\s+/);
          const commandName = parts[0];
          const args = parts.slice(1);

          const command = getCommand(commandName);
          if (command) {
            ctx.args = args;
            await command.execute(ctx);
            continue;
          }
        }

        // Check for media
        if (hasMedia) {
          const handler = getMediaHandler(mediaType);
          if (handler) {
            await handler.execute(ctx);
            continue;
          }
        }
      } catch (error) {
        console.error('[ERROR]', (error as Error).message);
      }
    }
  });
}

/**
 * Graceful shutdown
 */
export async function shutdown(): Promise<void> {
  if (sock) {
    console.log('[SYS] Closing WhatsApp connection...');
    sock.end(undefined);
    sock = null;
  }
}
