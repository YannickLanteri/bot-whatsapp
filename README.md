# 🤖 WhatsApp Gemini Voice Assistant

![Banner](./banner.png)

A powerful WhatsApp bot built with **Node.js**, **whatsapp-web.js**, and **Google Gemini 3.0 Flash**. This bot listens to your voice notes, transcribes them, and provides a stylish summary with key takeaways and action items.

## 🚀 Features

- 🎤 **Voice Transcription**: Automatically transcribes any voice note sent by whitelisted numbers.
- 📌 **Smart Summaries**: Provides a one-sentence synthesis, minute-by-minute timeline (for long audios), and key takeaways.
- ✅ **Action Items**: Extracts tasks and action items from your voice messages.
- 🔒 **Security First**: Whitelist-only mode. The bot ignores everyone except your specified numbers.
- 🏓 **Ping-Pong**: A simple `!ping` command to check if the bot is alive.

## 🛠️ Setup

### 1. Prerequisites
- A WhatsApp account (Physical phone with WhatsApp or WhatsApp Business).
- A Google AI (Gemini) API Key. [Get one here](https://aistudio.google.com/).
- A [Railway](https://railway.app/) account for hosting (optional but recommended).

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key
WHITELISTED_NUMBERS=336xxxxxxxx,336yyyyyyyy
```
*Note: Numbers should be in international format without the `+` sign (e.g., `33612345678` for a French number).*

### 3. Local Installation
```bash
npm install
npm start
```
Scan the QR code that appears in your terminal. Your session will be saved in the `.wwebjs_auth` folder.

## ☁️ Deployment on Railway

This project is optimized for Railway with **Persistent Volumes** to ensure you only scan the QR code once.

1. **Push to GitHub**: Fork or push this repo to your private/public GitHub.
2. **Create Railway Project**: Choose "Deploy from GitHub repo".
3. **Configure Variables**: Add `GEMINI_API_KEY` and `WHITELISTED_NUMBERS` in the Railway dashboard.
4. **Scan QR Code**: 
   - Check the Railway deployment **Logs**.
   - You will see a link like `https://api.qrserver.com/...`
   - Open the link, scan the QR code with your phone.
5. **Done!** The session is now saved in a persistent volume. The bot will stay online even after redeployments.

## 📝 Performance Tips
The bot uses `gemini-3-flash-preview` for the best balance between speed, cost, and high-quality audio analysis.

## 🛡️ Privacy & Security
The bot is designed to be **private**. It will only respond to messages coming from the numbers listed in your `WHITELISTED_NUMBERS`.

---
*Disclaimer: This project is not affiliated with WhatsApp or Google. Use responsibly.*
