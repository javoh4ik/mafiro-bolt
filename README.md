# 🎩 MAFIRO — Online Mafia (Bolt.new Edition)

A bespoke, dark-luxury psychological multiplayer Mafia game built with **React 19**, **TypeScript**, and **Tailwind CSS**.

[![Open in Bolt.new](https://bolt.new/badge.svg)](https://bolt.new/~/github.com/javoh4ik/mafiro-bolt)

---

## ✨ Features

- **🎮 Seamless Client-Side Game Engine**: Zero-mock browser engine using `localStorage` and `BroadcastChannel('mafiro_sync')`. Play directly in browser previews or across multiple browser tabs without requiring a Python backend.
- **🔌 Automatic Backend Reconnect**: Transparently connects to FastAPI WebSockets when available, with automatic fallback when offline or in browser-only environments.
- **🃏 Hold-to-Peek 3D Secret Role Card**: Screen-peeking protection with smooth 3D card-flip animations.
- **🏛️ Modern Velvet Table**: Clean geometric coordinate layout supporting 4 to 12 seats with rich emerald felt gradients and wooden bronze rims.
- **💬 Telegram-Style Mafia Chat**: Dedicated Syndicate Night chat for Don & Mafia, court debates, and real-time voting.
- **✨ Complete Mafia State Machine**: Lobby ➔ Night ➔ Day ➔ Vote ➔ Game Over cycles.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🌐 Instant Bolt.new Launch

Click the badge above or navigate to:
**https://bolt.new/~/github.com/javoh4ik/mafiro-bolt**
