# Blockchain Explorer, Wallet, and Smart Contract Demo

A compact full-stack project for exploring blockchain concepts end to end: a layered Express
backend implementing a simplified chain, a React dashboard with a realistic non-custodial wallet
and block explorer, and a standalone Solidity token contract with a Hardhat deployment/test setup.

It combines:
- a layered Express backend for a simplified blockchain (blocks, PoW mining, signed transactions, persistence)
- a React app with an HD (Hierarchical Deterministic) wallet, client-side transaction signing, and a block/transaction/address explorer
- a Solidity smart contract with an env-driven Hardhat deploy script and test suite
- a persistence layer so the chain survives restarts

---

## What’s Included

### Backend
- Express API for chain, transactions, mining, balance, stats, wallets, and explorer search
- Blockchain domain model: block hashing, proof-of-work mining, ECDSA signature verification, and chain validation
- Server-side balance enforcement (a transaction cannot spend more than the sender's available funds)
- Persistence layer that saves/restores blockchain state to a JSON file
- Centralized middleware for error handling, logging, validation, and rate limiting

### Frontend
- A **non-custodial HD (Hierarchical Deterministic) wallet** (BIP-39 recovery phrase + BIP-32 derivation): create, import (phrase or private key), one seed to many accounts, switch/add account
- Keys are generated **entirely in the browser** and stored in an **encrypted vault** (WebCrypto PBKDF2 + AES-GCM); unlocked with a password on load/refresh
- **Client-side transaction signing** (secp256k1): the private key never leaves the browser, only the signature is sent
- A **block explorer**: search by block hash, transaction hash, or address
- A **Dashboard** to inspect chain state, mine blocks, and create transactions, with polling-based refresh

### Smart Contracts
- Solidity token in [contracts/AssessmentToken.sol](contracts/AssessmentToken.sol), fully documented with NatSpec
- Env-driven Hardhat config, deploy script ([scripts/deploy-contract.js](scripts/deploy-contract.js)), and a chai test suite

---

## Project Structure

```text
├── config/            # env-driven configuration
├── controllers/       # request handlers (chain, transactions, mining, search, ...)
├── contracts/         # Solidity source (AssessmentToken.sol)
├── contract-test/     # Hardhat contract tests
├── middleware/        # error handling, logging, validation, rate limiting
├── models/            # blockchain domain model (Block, Transaction, Blockchain)
├── routes/            # Express route definitions
├── scripts/           # deploy-contract.js
├── services/          # persistence service
├── src/
│   ├── api/           # frontend API helper layer + endpoints
│   ├── components/    # UI (wallet/, explorer, transaction form, ...)
│   ├── context/       # WalletContext (shared wallet state)
│   ├── hooks/         # useBlockchain, useWallet
│   └── utils/         # hdWallet, vault, signing
├── tests/             # backend regression suite (node --test)
├── hardhat.config.js
├── server.js
└── .env.example
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & configure

```bash
npm install
cp .env.example .env
```

`.env.example` documents every variable (API settings plus the Hardhat deploy settings).

### Run the app (development)

```bash
# Terminal 1 — React dev server (port 3000)
npm start

# Terminal 2 — API server (port 3002, auto-reloads)
npm run dev
```

The React dev server proxies `/api/*` to the backend via [src/setupProxy.js](src/setupProxy.js).
To build and serve everything from the API server on port 3002 instead, run `npm run serve`.

---

## Wallet & Signing

The wallet is **non-custodial** - modeled on real browser wallets:

- **Create** generates a 12-word BIP-39 recovery phrase, has you confirm it, and derives accounts via
  BIP-32 at `m/44'/60'/0'/0/<index>` (one seed → many accounts).
- **Import** supports a recovery phrase or a raw private key (single account).
- The seed is encrypted with a password and only the `{ salt, iv, ciphertext }` is stored in `localStorage`. **The password itself is never stored**. A wrong password simply fails authenticated decryption.
- On load/refresh the wallet is **locked**; you enter your password to unlock. Private keys are derived
  in memory only while unlocked.
- Transactions are **signed locally** with secp256k1; the signed payload (public fields + signature +
  timestamp) is sent to `POST /api/transactions`, which verifies the signature against the sender's
  public key and enforces the sender's available balance.

---

## Explorer

Below the block list, the explorer searches the chain by:
- **block hash**: block details and height
- **transaction hash**: the transaction and its block (or `pending` if not yet mined)
- **address / public key**: balance and the transactions involving it

Each transaction now carries a stable hash, returned by `POST /api/transactions` and shown after sending.

---

## API Overview

All responses follow `{ "success": true, ... }` (or `{ "success": false, "error": "..." }`).

| Method | Path | Description |
|---|---|---|
| GET | /api/chain | Return the full blockchain |
| GET | /api/chain/valid | Return whether the chain is valid |
| POST | /api/transactions | Add a signed pending transaction (returns `transactionHash`) |
| GET | /api/transactions/pending | View pending transactions |
| POST | /api/mine | Mine the pending transactions |
| GET | /api/balance/:address | Get an address balance |
| GET | /api/stats | View chain and mining statistics |
| GET | /api/search?q= | Explorer search by block hash, transaction hash, or address |
| POST | /api/wallets | Generate a key pair (legacy — the app now generates keys client-side) |
| GET | /api/wallets/:address | View a balance for a wallet address |

---

## Smart Contract

The Solidity contract in [contracts/AssessmentToken.sol](contracts/AssessmentToken.sol) is a
hand-rolled ERC-20-style token. It demonstrates supply initialization, balance tracking, the
transfer/approve/transferFrom flow, allowances, and events. It is fully documented,
including its known limitations.

> **Note — the contract is a standalone artifact, by design.** It is **not** connected to the
> JavaScript blockchain that powers the Express API and React app. That in-memory chain is its own
> system; `AssessmentToken` is a separate deliverable meant to run on an EVM (a local Hardhat node
> or any RPC network). The two do not, and are not meant to, interact.

### Compile & test

```bash
npm run contract:compile   # hardhat compile
npm run contract:test      # hardhat test  (8 passing)
```

### Deploy

Deployment is driven entirely by environment variables (see `.env.example`), so the same script targets a local node or any RPC network without code changes.

```bash
# Option A — local in-process node
npm run chain              # starts a Hardhat node on 127.0.0.1:8545 (terminal 1)
npm run deploy:local       # deploys to it (terminal 2)

# Option B — any external network
# Set RPC_URL, CHAIN_ID and DEPLOYER_PRIVATE_KEY in .env, then:
npm run deploy
```

`INITIAL_SUPPLY` (default `1000000`) controls the whole-token supply minted to the deployer.

---

## Testing

- **Backend regression suite** in [tests/blockchain.test.js](tests/blockchain.test.js): `node --test`
- **Contract tests** (Hardhat + chai): `npm run contract:test`

---

## Known Limitations & Trade-offs

- The blockchain is a simplified educational implementation, not a production-grade distributed ledger
- The wallet stores its encrypted seed in `localStorage`. Encrypted by a password.
- The smart contract is intentionally minimal and hand-rolled for clarity; in production you would extend OpenZeppelin's audited `ERC20`.

---

## License

One More Game
