# Product Registry Smart Contract

## Overview
This is a sample Solidity smart contract for the product tracking system. Deploy this contract to your preferred blockchain network (Ethereum, Polygon, etc.) and add the contract address to your `.env` file.

## Smart Contract Code

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductRegistry {
    struct Product {
        string productId;
        string authenticityHash;
        address manufacturer;
        address currentOwner;
        bool exists;
    }
    
    mapping(uint256 => Product) public products;
    uint256 public tokenCounter;
    
    event ProductRegistered(uint256 indexed tokenId, string productId, address owner);
    event ProductTransferred(uint256 indexed tokenId, address from, address to);
    
    function registerProduct(
        string memory _productId,
        string memory _authenticityHash
    ) public returns (uint256) {
        uint256 tokenId = tokenCounter;
        
        products[tokenId] = Product({
            productId: _productId,
            authenticityHash: _authenticityHash,
            manufacturer: msg.sender,
            currentOwner: msg.sender,
            exists: true
        });
        
        tokenCounter++;
        
        emit ProductRegistered(tokenId, _productId, msg.sender);
        
        return tokenId;
    }
    
    function transferProduct(uint256 _tokenId, address _to) public {
        require(products[_tokenId].exists, "Product does not exist");
        require(products[_tokenId].currentOwner == msg.sender, "Not the owner");
        require(_to != address(0), "Invalid address");
        
        address from = products[_tokenId].currentOwner;
        products[_tokenId].currentOwner = _to;
        
        emit ProductTransferred(_tokenId, from, _to);
    }
    
    function verifyProduct(uint256 _tokenId) public view returns (
        bool exists,
        string memory productId,
        address currentOwner
    ) {
        Product memory product = products[_tokenId];
        return (product.exists, product.productId, product.currentOwner);
    }
    
    function getProductDetails(uint256 _tokenId) public view returns (
        string memory productId,
        string memory authenticityHash,
        address manufacturer,
        address currentOwner
    ) {
        require(products[_tokenId].exists, "Product does not exist");
        Product memory product = products[_tokenId];
        return (
            product.productId,
            product.authenticityHash,
            product.manufacturer,
            product.currentOwner
        );
    }
}
```

## Deployment Instructions

### Option 1: Deploy using Remix IDE (Recommended)

1. **Setup MetaMask for Polygon Amoy Testnet:**
   - Open MetaMask
   - Add Custom Network with these details:
     - **Network Name:** `Polygon Amoy Testnet`
     - **RPC URL:** `https://rpc-amoy.polygon.technology/`
     - **Chain ID:** `80002`
     - **Currency Symbol:** `MATIC`
     - **Block Explorer:** `https://amoy.polygonscan.com/`

2. **Get Testnet MATIC:**
   - Visit [Polygon Faucet](https://faucet.polygon.technology/)
   - Select "Amoy Testnet"
   - Enter your wallet address
   - Receive free test MATIC

3. **Deploy Contract:**
   - Go to [Remix IDE](https://remix.ethereum.org/)
   - Create a new file called `ProductRegistry.sol`
   - Paste the contract code above
   - Compile the contract (Solidity version ^0.8.0)
   - Go to "Deploy & Run Transactions" tab
   - Select "Injected Provider - MetaMask"
   - Ensure MetaMask is connected to Polygon Amoy Testnet
   - Click "Deploy"
   - Confirm the transaction in MetaMask
   - Copy the deployed contract address

### Option 2: Deploy using Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

Create `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      url: "https://rpc-amoy.polygon.technology/",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

Deploy:
```bash
npx hardhat run scripts/deploy.js --network amoy
```

## Configuration

After deployment, add the contract address to your `.env` file:

```env
VITE_CONTRACT_ADDRESS=0xYourContractAddressHere
```

## Network Recommendations

### For Testing
- **Polygon Amoy Testnet** (Recommended): Fast, cheap, plenty of faucets
- **Sepolia** (Ethereum Testnet): Widely supported alternative
- Get testnet MATIC from [Polygon Faucet](https://faucet.polygon.technology/)

### For Production
- **Polygon Mainnet**: Fast, cheap transactions (~$0.01 per transaction)
- **Ethereum Mainnet**: Most secure, but expensive (~$5-50 per transaction)
- **BSC Mainnet**: Medium cost and speed

## Testing the Integration

1. Connect MetaMask to the network where you deployed the contract
2. Add the contract address to your `.env` file
3. Restart your development server
4. Connect your wallet in the Supply Chain page
5. Try registering a product - it will create a blockchain transaction
6. View the transaction on a block explorer (Etherscan, Polygonscan, etc.)

## Contract Features

- ✅ Register products on-chain with authenticity hash
- ✅ Transfer ownership between addresses
- ✅ Verify product authenticity
- ✅ Get complete product details
- ✅ Event logging for all transactions
- ✅ Ownership validation

## Gas Optimization Tips

- Registering a product: ~100,000 gas
- Transferring ownership: ~50,000 gas
- On Polygon: Each transaction costs less than $0.01
- On Ethereum: Can cost $5-50 depending on network congestion

## Security Considerations

- Only the current owner can transfer a product
- Products cannot be transferred to zero address
- All state changes emit events for tracking
- Product data is immutable once registered
- Manufacturer address is recorded permanently
