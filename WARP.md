# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Apex Chain Systems - A blockchain-based supply chain tracking application built with React, TypeScript, and Ethereum smart contracts. The system allows product registration, ownership transfer, and authenticity verification on the Polygon blockchain.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development environment
npm run build:dev

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript, Vite as build tool
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React hooks and Tanstack Query
- **Database**: Supabase for product data and authentication
- **Blockchain**: Ethereum smart contracts via ethers.js
- **Network**: Polygon Amoy Testnet (Chain ID: 80002)

### Project Structure
- `/src/pages/` - Main application pages (Dashboard, SupplyChain, Login, etc.)
- `/src/components/supply-chain/` - Blockchain-specific components (WalletConnect, ProductCard, TransferDialog)
- `/src/components/ui/` - Reusable shadcn/ui components
- `/src/integrations/supabase/` - Supabase client and type definitions
- `/src/hooks/` - Custom React hooks including useWeb3 for blockchain interaction
- `/contracts/` - Solidity smart contract (ProductRegistry.sol)

### Key Integration Points

#### Blockchain Integration
The application connects to Polygon Amoy Testnet through MetaMask. The smart contract address is stored in `.env` as `VITE_CONTRACT_ADDRESS`. The contract provides:
- Product registration with unique token IDs
- Ownership transfer between wallets
- Product authenticity verification
- Immutable manufacturer records

#### Database Schema (Supabase)
Products table includes:
- `product_id` - Unique product identifier
- `blockchain_token_id` - On-chain token reference
- `manufacturer_address` - Ethereum address of manufacturer
- `current_owner_address` - Current owner's wallet address
- `authenticity_hash` - Unique hash for verification
- `status` - Product lifecycle status

## Smart Contract Deployment

To deploy a new contract instance:

1. Open [Remix IDE](https://remix.ethereum.org/)
2. Copy content from `contracts/ProductRegistry.sol`
3. Compile with Solidity ^0.8.0
4. Deploy using Injected Provider (MetaMask) to Polygon Amoy
5. Update `VITE_CONTRACT_ADDRESS` in `.env` with new contract address
6. Restart development server

## Environment Configuration

Required environment variables in `.env`:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anonymous key
- `VITE_CONTRACT_ADDRESS` - Deployed smart contract address on Polygon Amoy

## Testing Guidelines

Currently no test framework is configured. When implementing tests:
- Check for testing framework in package.json before setup
- For smart contract testing, consider using Hardhat or Truffle
- For React components, consider Jest with React Testing Library

## Code Quality

The project uses ESLint with TypeScript support. Key configuration:
- TypeScript strict mode is disabled (`strictNullChecks: false`)
- Unused variables warning is turned off
- React Refresh plugin for HMR support
- Path alias `@/` maps to `./src/`

Run linting with: `npm run lint`

## Blockchain Network Details

**Polygon Amoy Testnet:**
- RPC URL: `https://rpc-amoy.polygon.technology/`
- Chain ID: `80002`
- Currency: MATIC (test tokens)
- Block Explorer: `https://amoy.polygonscan.com/`
- Faucet: [Polygon Faucet](https://faucet.polygon.technology/)

## Development Workflow

1. Connect wallet to Polygon Amoy testnet via MetaMask
2. Ensure test MATIC tokens are available
3. Start development server with `npm run dev`
4. Access application at `http://localhost:8080`
5. Use Supply Chain page for blockchain operations
6. Products are stored in both Supabase and blockchain

## Important Implementation Details

- Web3 connection is managed through `useWeb3` hook
- Contract interactions use ethers.js v6
- Product registration creates both database and blockchain records
- Blockchain token IDs are extracted from transaction event logs
- Failed blockchain transactions fallback to database-only storage
- Authentication is handled by Supabase Auth