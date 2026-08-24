# Kyro — Online Betting Platform

Next.js frontend for the **Kyro** betting platform: browse games, fund your wallet, and launch titles in browser or desktop.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## User flow

1. **Games** (`/store`) — Browse the betting catalog and launch any title
2. **Wallet** (`/wallet`) — Deposit funds via crypto (BTC, ETH, USDC)
3. **Play** (`/play/[slug]`) — Sign in required; browser or desktop launcher

## Features

- **Game catalog** — Providers, slots, live tables, and more via backend API
- **Wallet** — Deposits and withdrawals through the backend
- **Launch / kick** — Start and end game sessions through the backend proxy
- **Support** — Help center, contact tickets, refunds, responsible gaming
- **Auth** — Login, register, account

## Connect your backend

```env
NEXT_PUBLIC_API_URL=http://localhost/scorpio
NEXT_PUBLIC_API_PREFIX=/wp-json/scorpioplay/v1
```

All API calls go through the backend — no platform keys in the frontend.

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/wallet/deposit` | POST | Deposit funds |
| `/wallet/withdraw` | POST | Withdraw funds |
| `/wallet/transactions` | GET | Transaction history |
| `/transaction/list` | GET | Player balance (`playerExternalId`) |

## Project structure

```
src/
  app/           # Routes (store, wallet, play, …)
  components/    # UI, game cards, launcher
  context/       # Auth state
  lib/api/       # API client (browser + server)
  types/         # Shared TypeScript types
```
