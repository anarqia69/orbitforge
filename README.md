# OrbitForge

A non-custodial Solana SPL token creation interface built with Next.js, TypeScript, Solana Web3.js and SPL Token.

## Features in this MVP
- Phantom and Solflare wallet connection
- Mainnet SPL mint creation
- Associated token account creation and initial supply minting
- Optional mint-authority and freeze-authority revocation in the creation transaction
- Solscan links for the mint and transaction

## Important scope notes
This initial release does **not** publish Metaplex token metadata, create liquidity pools, or provide a transaction-history dashboard. Those require additional integrations and testing. The UI does not claim those features are live.

## Run locally

```bash
npm install
npm run dev
``

Open http://localhost:3000.

## Deploy to Vercel
Import this GitHub repository into Vercel. Framework preset: Next.js. No environment variables are required for the current MVP. Deploy to production only after reviewing the code and testing with a small-value test mint; the app targets Solana mainnet and transactions cost SOL.

## Security
- No seed phrase or private key is requested or stored.
- The mint keypair is generated in the browser and signs only the mint-account creation transaction.
- Wallet approval is required for each transaction.
- Authority revocation is irreversible.
