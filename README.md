# WhatsApp Gemini Voice Assistant

![Banner](./banner.png)

A WhatsApp bot built with **TypeScript**, **whatsapp-web.js**, and **Google Gemini AI**. Listens to voice notes, transcribes them, and provides smart summaries based on duration.

## Features

- **Adaptive Analysis**: Response adapts to voice message duration
  - < 30s: Transcription only
  - 30s - 2min: Short summary + key points
  - \> 2min: Full summary + `!details` option
- **Smart Summaries**: Key takeaways, action items, and timeline for long messages
- **Whitelist Security**: Only responds to specified phone numbers
- **Modular Architecture**: Easy to add new commands and handlers

## Commands

| Command | Description |
|---------|-------------|
| `!ping` | Health check |
| `!help` | Show available commands |
| `!details` | Get detailed analysis of last voice message |

## Setup

### Prerequisites
- Node.js 18+
- WhatsApp account
- [Google Gemini API Key](https://aistudio.google.com/)

### Environment Variables

Create a `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key
WHITELISTED_NUMBERS=336xxxxxxxx,336yyyyyyyy
```
Numbers in international format without `+` (e.g., `33612345678` for France).

### Installation

```bash
npm install
npm run build
npm start
```

### Development

```bash
npm run dev:ts   # Run with hot reload
npm test         # Run unit tests
npm run test:coverage  # Run tests with coverage
```

## Project Structure

```
src/
├── index.ts              # Entry point
├── types/                # TypeScript types
├── config/               # Configuration & whitelist
├── client/               # WhatsApp client setup
├── commands/             # Bot commands (ping, help, details)
├── handlers/             # Media handlers (voice)
└── services/             # Gemini AI, cache, cleanup
```

## Deployment (Railway)

1. Push to GitHub
2. Create Railway project from repo
3. Add environment variables in dashboard
4. Check logs for QR code link
5. Scan QR code once - session persists via volume

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **WhatsApp**: whatsapp-web.js
- **AI**: Google Gemini 2.0 Flash
- **Testing**: Vitest

## License

MIT

---
*Not affiliated with WhatsApp or Google. Use responsibly.*
