# Smart Contract Deployment Guide for Polygon Amoy Testnet

## Prerequisites
✅ MetaMask installed with Amoy testnet configured  
✅ Test MATIC tokens in your wallet

## Step 1: Open Remix IDE
1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file: Click "contracts" folder → "+" → Name it `ProductRegistry.sol`

## Step 2: Copy Contract Code
1. Copy the entire content from `contracts/ProductRegistry.sol` 
2. Paste it into the Remix editor

## Step 3: Compile the Contract
1. Go to "Solidity Compiler" tab (left sidebar)
2. Select compiler version: `0.8.20` or any `0.8.x`
3. Click "Compile ProductRegistry.sol"
4. You should see a green checkmark ✅

## Step 4: Deploy to Amoy Testnet
1. Go to "Deploy & Run Transactions" tab (left sidebar)
2. **IMPORTANT:** Under "Environment", select `Injected Provider - MetaMask`
3. MetaMask will popup - ensure you're on "Polygon Amoy Testnet"
4. Your account address should appear with balance
5. Click the orange "Deploy" button
6. MetaMask will popup with transaction details
7. Click "Confirm" in MetaMask
8. Wait for transaction to complete (10-30 seconds)

## Step 5: Get Contract Address
1. After deployment, look at the bottom section "Deployed Contracts"
2. You'll see "PRODUCTREGISTRY AT 0x..." 
3. Click the copy button next to the address
4. **This is your contract address!**

## Step 6: Update Your Project
1. Open `.env` file in your project
2. Replace the existing contract address:
```
VITE_CONTRACT_ADDRESS="YOUR_NEW_CONTRACT_ADDRESS_HERE"
```
3. Save the file
4. Restart your development server: `npm run dev`

## Step 7: Verify Deployment
1. Go to [Amoy PolygonScan](https://amoy.polygonscan.com/)
2. Paste your contract address in search
3. You should see your contract with creation transaction

## Testing the Integration

### In Your Application:
1. Go to Supply Chain page
2. Click "Connect Wallet" button
3. MetaMask will popup - approve connection
4. You should see your wallet address
5. Click "ADD PRODUCT" 
6. Fill the form and submit
7. MetaMask will popup for transaction approval
8. After confirmation, product is registered on blockchain!

### Verify on Blockchain:
1. Check transaction on [Amoy PolygonScan](https://amoy.polygonscan.com/)
2. Product will have a blockchain token ID
3. You can track all transfers and ownership changes

## Troubleshooting

### "Wrong Network" Error
- Switch to Polygon Amoy in MetaMask
- Network ID should be 80002

### "Insufficient Funds" Error
- Get free test MATIC from [Polygon Faucet](https://faucet.polygon.technology/)
- Select Amoy testnet
- Enter your wallet address

### Contract Not Working
- Ensure you copied the correct contract address
- Check if contract is deployed to Amoy (not another network)
- Verify `.env` file has correct address
- Restart dev server after changing `.env`

## Current Contract Features
✅ Register products with unique IDs  
✅ Transfer ownership between wallets  
✅ Verify product authenticity  
✅ Immutable manufacturer records  
✅ Complete transaction history  

## Gas Costs (Approximate)
- Register Product: ~0.01 MATIC
- Transfer Ownership: ~0.005 MATIC
- Verify Product: FREE (read-only)

Your blockchain integration is ready! 🚀
