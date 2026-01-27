import type { Command } from '../types';
import { config } from '../config';

/**
 * Help command - List available commands
 * Usage: !help
 */
export const helpCommand: Command = {
  name: 'help',
  description: 'Display available commands',

  async execute({ message, client }) {
    console.log('Command: !help');

    const helpText = `📖 *Commandes*

${config.commandPrefix}ping - Test de connexion
${config.commandPrefix}help - Affiche cette aide
${config.commandPrefix}details - Analyse approfondie du dernier vocal

🎙️ *Messages Vocaux*

Envoie un vocal et choisis :
1️⃣ Transcription complète
2️⃣ Résumé rapide
3️⃣ Les deux
4️⃣ Points d'action (todos)
5️⃣ Traduire (détection auto)

📷 *Images* (bientôt)

1️⃣ Scanner carte de visite
2️⃣ Extraire le texte (OCR)`;

    await client.sendMessage(message.from, helpText);
    console.log('Help sent');
  },
};
