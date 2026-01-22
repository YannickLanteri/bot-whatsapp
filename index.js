require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenAI } = require('@google/genai');

// Initialisation Gemini (nouveau SDK)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Whitelist - supporte plusieurs numéros séparés par des virgules
const WHITELISTED_NUMBERS = process.env.WHITELISTED_NUMBERS
    ? process.env.WHITELISTED_NUMBERS.split(',').map(n => n.trim())
    : [];

console.log(`📋 Numéros whitelistés: ${WHITELISTED_NUMBERS.join(', ')}`);

// Vérifie si un numéro est autorisé
function isWhitelisted(from) {
    return WHITELISTED_NUMBERS.some(num => from === `${num}@c.us`);
}

// Initialisation WhatsApp
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: '.wwebjs_auth'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('📱 SCANNE CE QR CODE :');
    // En local: affiche le QR en ASCII
    if (process.env.NODE_ENV !== 'production') {
        qrcode.generate(qr, { small: true });
    }
    // Pour Railway: affiche un lien pour générer le QR
    console.log('🔗 Ou ouvre ce lien pour voir le QR :');
    console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
});

client.on('authenticated', () => console.log('✅ Authentifié!'));
client.on('auth_failure', (msg) => console.error('❌ Auth fail:', msg));
client.on('ready', () => {
    console.log('🚀 Bot prêt!');
    console.log(`📋 Whitelist: ${WHITELISTED_NUMBERS.map(n => n + '@c.us').join(', ')}`);
});
client.on('disconnected', (reason) => console.log('🔌 Déconnecté:', reason));

client.on('message', async (msg) => {
    console.log(`📨 ${msg.from}: "${msg.body}"`);
    
    if (!isWhitelisted(msg.from)) {
        console.log(`🚫 Ignoré`);
        return;
    }

    try {
        // !ping
        if (msg.body === '!ping') {
            console.log('🏓 !ping');
            await client.sendMessage(msg.from, 'pong 🏓', { sendSeen: false });
            console.log('✅ pong envoyé');
            return;
        }

        // Message vocal
        if (msg.hasMedia && (msg.type === 'audio' || msg.type === 'ptt')) {
            console.log('🎤 Vocal...');
            await client.sendMessage(msg.from, '⏳ Analyse en cours...', { sendSeen: false });
            
            const media = await msg.downloadMedia();
            if (!media) {
                await client.sendMessage(msg.from, '❌ Téléchargement échoué', { sendSeen: false });
                return;
            }

            // Prompt optimisé en anglais pour précision
            const prompt = `Analyze this voice note.

Create a high-quality summary in FRENCH.

If the audio is long (more than 1 minute), provide a minute-by-minute timeline.

Extract key takeaways and action items.

Format your response EXACTLY like this (keep the emojis and structure):

📌 RÉSUMÉ :
(One sentence synthesis of the entire message)

⏳ CHRONOLOGIE :
• [0:00 - 1:00] : ...
• [1:00 - 2:00] : ...
(Skip this section if audio is less than 1 minute)

💡 POINTS CLÉS :
• Point 1
• Point 2
• Point 3

✅ ACTIONS :
• Action item 1
• Action item 2
(Skip this section if no action items)`;

            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [
                    { text: prompt },
                    { 
                        inlineData: { 
                            data: media.data, 
                            mimeType: media.mimetype 
                        } 
                    }
                ]
            });

            // Formatage beauté WhatsApp
            const formattedResponse = `┏━━━━━━━━━━━━━━━━┓
   🎤 *ANALYSE VOCALE*
┗━━━━━━━━━━━━━━━━┛

${response.text}

━━━━━━━━━━━━━━━━━━`;

            await client.sendMessage(msg.from, formattedResponse, { sendSeen: false });
            console.log('✅ Résumé envoyé');
        }
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
});

process.on('unhandledRejection', (r) => console.error('⚠️', r));
process.on('uncaughtException', (e) => console.error('⚠️', e.message));
process.on('SIGINT', async () => { await client.destroy(); process.exit(0); });

console.log('🤖 Démarrage...');
client.initialize();