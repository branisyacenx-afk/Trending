# صقور الجزائر — MT5 Bridge (MVP)

This is the first real broker-connectivity service for the Trading platform. It uses the official MetaTrader 5 Python integration and must run on a Windows machine where the MT5 desktop terminal is installed.

## Current scope

- Connects one MT5 terminal/account per bridge process.
- Reads verified terminal/account state, balance, equity, margin, quotes and open positions.
- Supports a guarded market-order endpoint with mandatory stop-loss and take-profit.
- Rejects symbols outside the server allow-list and volumes above the server limit.
- Live-account order execution is disabled by default and has multiple explicit server-side gates.

## Important limitations

- This is a single-terminal connector, not yet a multi-tenant service. Do not point several customer accounts at one process.
- The React browser app must never call this bridge directly or receive `BRIDGE_API_KEY`. A trusted backend/API gateway must authenticate the signed-in user, verify account ownership and approval, enforce per-user risk policy, then call the bridge.
- The bridge is not deployed by GitHub. A secured, always-on Windows VPS, a broker demo account and MT5 terminal configuration are required.
- No live trading should be enabled before demo testing, independent review, and explicit operational approval.
- Never store broker passwords in the frontend, Supabase rows, logs, or Git history.

## Windows VPS setup

1. Install MetaTrader 5 from the selected broker and sign in to a DEMO account.
2. Install Python 3.11 (64-bit).
3. Copy `.env.example` to `.env` on the VPS only, then set a unique random `BRIDGE_API_KEY`, demo login, password and exact broker server name.
4. Install dependencies: `py -3.11 -m venv .venv`, `.venv\\Scripts\\activate`, then `pip install -r requirements.txt`.
5. Run locally for initial verification: `uvicorn main:app --host 127.0.0.1 --port 8787`.
6. Keep the service private behind a VPN or authenticated reverse proxy. Do not expose port 8787 publicly without TLS, firewall allow-listing and rate limiting.
7. Verify `/health`, `/account`, `/quote/EURUSD` and `/positions` using the bridge API key before wiring it into the platform.

## API authentication

Every endpoint requires the `X-Bridge-Key` header. The key must be at least 32 characters. Store it only in the trusted backend's secret store.

## Order endpoint

`POST /orders` accepts `symbol`, `side`, `volume`, `stop_loss` and `take_profit`. It runs broker pre-checks and server-side limits before calling MT5. Start only on a demo account.

For real accounts, the server must separately set `ALLOW_LIVE_TRADING=true`, set `LIVE_TRADING_ACK=I_UNDERSTAND_REAL_MONEY_RISK`, and the caller must send both `confirm_live=true` and the exact acknowledgement. These are safeguards, not a guarantee against loss.

## Next integration stage

Add a trusted Supabase Edge Function/API gateway that:
- validates the user's Supabase JWT;
- verifies the user owns the selected account and it is approved;
- maps the account to its isolated bridge/terminal instance;
- never returns bridge secrets to the browser;
- stores broker-originated snapshots and deals using service-role credentials only;
- enforces per-account limits, idempotency and audit logs.

Only after that gateway and the Windows VPS are configured can the web dashboard display broker-verified account data.
