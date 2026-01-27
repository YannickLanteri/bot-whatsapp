# 🤖 Bot WhatsApp - Assistant Vocal IA

Un bot WhatsApp intelligent qui transforme vos messages vocaux en texte, résumés et actions. Propulsé par **Gemini AI** et **Baileys**.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

## ✨ Fonctionnalités

### 🎙️ Messages Vocaux
Envoyez un vocal et choisissez :

| Option | Description |
|--------|-------------|
| 1️⃣ **Transcription** | Texte mot à mot |
| 2️⃣ **Résumé** | Points clés condensés |
| 3️⃣ **Les deux** | Transcription + Résumé |
| 4️⃣ **Todos** | Extraction des actions à faire |
| 5️⃣ **Traduire** | Détection langue + traduction FR/EN |

### 🔄 Réanalyse
Après une analyse, envoyez un autre numéro pour analyser le même vocal différemment !

### 📷 Images (bientôt)
- Scan de cartes de visite
- OCR (extraction de texte)

## 🚀 Installation

### Prérequis
- Node.js 18+
- Clé API Gemini ([Obtenir ici](https://aistudio.google.com/apikey))

### Local

```bash
# Clone
git clone https://github.com/YannickLanteri/bot-whatsapp.git
cd bot-whatsapp

# Install
npm install

# Configure
cp .env.example .env
# Édite .env avec ta clé Gemini et numéros autorisés

# Lance
npm run dev:ts
# Scanne le QR code avec WhatsApp > Appareils liés
```

### Railway (Production)

1. Fork ce repo
2. Crée un projet Railway et connecte ton repo
3. Ajoute les variables d'environnement :
   - `GEMINI_API_KEY` - Ta clé API Gemini
   - `WHITELISTED_NUMBERS` - Numéros autorisés (ex: `33612345678,33698765432`)
4. Ajoute un **Volume** : Mount path → `/app/auth_info_baileys`
5. Deploy !

## ⚙️ Configuration

| Variable | Description | Exemple |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Clé API Google Gemini | `AIza...` |
| `WHITELISTED_NUMBERS` | Numéros autorisés (sans +) | `33612345678` |
| `COMMAND_PREFIX` | Préfixe des commandes | `!` (défaut) |

## 📝 Commandes

| Commande | Description |
|----------|-------------|
| `!ping` | Test de connexion |
| `!help` | Affiche l'aide |
| `!details` | Analyse approfondie du dernier vocal |

## 🏗️ Architecture

```
src/
├── client/baileys.ts    # Client WhatsApp (Baileys)
├── handlers/
│   └── voice.ts         # Handler messages vocaux
├── services/
│   ├── gemini.ts        # Service IA Gemini
│   └── userState.ts     # État utilisateur (cache vocal)
└── commands/            # Commandes bot
```

## 🛠️ Stack Technique

- **[Baileys](https://github.com/WhiskeySockets/Baileys)** - Client WhatsApp léger (pas de navigateur)
- **[Gemini AI](https://ai.google.dev/)** - Transcription et analyse IA
- **TypeScript** - Typage fort
- **Railway** - Déploiement facile

## 📄 Licence

MIT - Fais-en ce que tu veux !

---

Made with ❤️ by [Yannick](https://github.com/YannickLanteri)
