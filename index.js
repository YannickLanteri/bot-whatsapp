require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

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
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
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
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('📱 [QR] NOUVEAU QR CODE GÉNÉRÉ');
    // En local: affiche le QR en ASCII
    if (process.env.NODE_ENV !== 'production') {
        qrcode.generate(qr, { small: true });
    }
    // Pour Railway: affiche un lien pour générer le QR
    console.log('🔗 SCANNE CE LIEN POUR TE CONNECTER :');
    console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
});

client.on('authenticated', () => {
    console.log('✅ [AUTH] Authentifié avec succès !');
});

client.on('auth_failure', (msg) => {
    console.error('❌ [AUTH] Échec de l\'authentification :', msg);
});

client.on('ready', () => {
    console.log('🚀 [BOT] Prêt et connecté !');
    console.log(`📋 Whitelist active pour: ${WHITELISTED_NUMBERS.join(', ')}`);
});

client.on('disconnected', (reason) => {
    console.log('🔌 [BOT] Déconnecté de WhatsApp :', reason);
});

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

process.on('unhandledRejection', (r) => console.error('⚠️ [ERREUR] Rejet non géré :', r));
process.on('uncaughtException', (e) => console.error('⚠️ [ERREUR] Exception non gérée :', e.message));

// Nettoyage propre au signal d'arrêt (Railway)
const shutdown = async (signal) => {
    console.log(`🔌 [SYS] Signal ${signal} reçu. Fermeture du bot...`);
    try {
        await client.destroy();
        console.log('✅ [SYS] Bot fermé proprement.');
        process.exit(0);
    } catch (err) {
        console.error('❌ [SYS] Erreur lors de la fermeture :', err);
        process.exit(1);
    }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Fonction pour nettoyer les verrous Chromium récursivement
const cleanupLocks = (dir) => {
    if (!fs.existsSync(dir)) return;
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.lstatSync(fullPath).isDirectory()) {
                cleanupLocks(fullPath);
            } else if (file === 'SingletonLock' || file === 'SingletonCookie' || file === 'SingletonSocket') {
                try {
                    fs.unlinkSync(fullPath);
                    console.log(`🧹 [SYS] Verrou supprimé : ${fullPath}`);
                } catch (e) {
                    console.error(`⚠️ [SYS] Impossible de supprimer ${file} :`, e.message);
                }
            }
        }
    } catch (err) {
        console.error('⚠️ [SYS] Erreur lors du parcours des dossiers :', err.message);
    }
};

console.log('🤖 [BOT] Nettoyage profond des verrous et démarrage...');
const authPath = path.join(__dirname, '.wwebjs_auth');
if (fs.existsSync(authPath)) {
    cleanupLocks(authPath);
} else {
    console.log('📂 [SYS] Dossier auth non trouvé, démarrage propre.');
}

client.initialize();