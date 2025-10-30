import { ethers } from 'ethers';
import { supabase } from '@/integrations/supabase/client';

// Contract ABI (simplified - in production, import from compiled contract)
const CONTRACT_ABI = [
  "function mintCertificate(address to, string productId, string uri, uint256 authenticityScore, string qrCode) returns (uint256)",
  "function getCertificate(uint256 tokenId) view returns (tuple(string productId, uint256 authenticityScore, uint256 timestamp, address manufacturer, string qrCode, bool isValid))",
  "function verifyCertificate(string productId) view returns (bool, uint256)",
  "function totalSupply() view returns (uint256)",
  "event CertificateMinted(uint256 indexed tokenId, string productId, address indexed owner, uint256 authenticityScore)"
];

// IPFS service for metadata storage (using Pinata as example)
class IPFSService {
  private readonly PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '';
  private readonly PINATA_SECRET = import.meta.env.VITE_PINATA_SECRET || '';
  
  async uploadMetadata(metadata: any): Promise<string> {
    // In production, use Pinata API to upload
    // For now, return mock IPFS URL
    const mockHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log('Uploading metadata to IPFS:', metadata);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return `ipfs://${mockHash}`;
  }
  
  async uploadImage(imageBlob: Blob): Promise<string> {
    // In production, upload image to IPFS
    const mockHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log('Uploading image to IPFS');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return `ipfs://${mockHash}`;
  }
}

export class NFTMintingService {
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;
  private ipfs: IPFSService;
  
  constructor() {
    this.ipfs = new IPFSService();
  }
  
  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    
    this.signer = await provider.getSigner();
    const address = await this.signer.getAddress();
    
    // Initialize contract
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    if (contractAddress) {
      this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.signer);
    }
    
    return address;
  }
  
  async mintNFTCertificate(
    productData: {
      productId: string;
      name: string;
      description: string;
      authenticityScore: number;
      imageUrl?: string;
      detectedLabels?: string[];
      qrCode: string;
    }
  ): Promise<{
    tokenId: string;
    transactionHash: string;
    ipfsUrl: string;
  }> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }
      
      const address = await this.signer.getAddress();
      
      // Upload image to IPFS if provided
      let imageIpfsUrl = '';
      if (productData.imageUrl) {
        // In production, convert base64 to blob and upload
        imageIpfsUrl = await this.ipfs.uploadImage(new Blob());
      }
      
      // Create NFT metadata following OpenSea standard
      const metadata = {
        name: `F1 Certificate #${productData.productId}`,
        description: productData.description,
        image: imageIpfsUrl,
        external_url: `https://apex-chain.com/verify/${productData.productId}`,
        attributes: [
          {
            trait_type: 'Authenticity Score',
            value: productData.authenticityScore,
            max_value: 100
          },
          {
            trait_type: 'Product ID',
            value: productData.productId
          },
          {
            trait_type: 'Verification Date',
            value: new Date().toISOString()
          },
          {
            trait_type: 'Detected Features',
            value: productData.detectedLabels?.join(', ') || 'N/A'
          }
        ]
      };
      
      // Upload metadata to IPFS
      const metadataUrl = await this.ipfs.uploadMetadata(metadata);
      
      // If contract is deployed, mint on-chain
      if (this.contract) {
        const tx = await this.contract.mintCertificate(
          address,
          productData.productId,
          metadataUrl,
          productData.authenticityScore,
          productData.qrCode
        );
        
        const receipt = await tx.wait();
        
        // Extract token ID from event
        const event = receipt.events?.find((e: any) => e.event === 'CertificateMinted');
        const tokenId = event?.args?.tokenId?.toString() || '0';
        
        // Store in database
        await this.saveToDatabase({
          productId: productData.productId,
          tokenId,
          transactionHash: receipt.transactionHash,
          ipfsUrl: metadataUrl,
          ownerAddress: address,
          authenticityScore: productData.authenticityScore
        });
        
        return {
          tokenId,
          transactionHash: receipt.transactionHash,
          ipfsUrl: metadataUrl
        };
      } else {
        // Mock minting for testing
        const mockTokenId = Math.floor(Math.random() * 10000).toString();
        const mockTxHash = '0x' + Array(64).fill(0).map(() => 
          Math.floor(Math.random() * 16).toString(16)).join('');
        
        await this.saveToDatabase({
          productId: productData.productId,
          tokenId: mockTokenId,
          transactionHash: mockTxHash,
          ipfsUrl: metadataUrl,
          ownerAddress: address,
          authenticityScore: productData.authenticityScore
        });
        
        return {
          tokenId: mockTokenId,
          transactionHash: mockTxHash,
          ipfsUrl: metadataUrl
        };
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }
  
  async estimateGasFees(): Promise<{
    estimatedGas: string;
    gasPriceGwei: string;
    totalCostMatic: string;
  }> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    const provider = this.signer.provider;
    if (!provider) {
      throw new Error('Provider not available');
    }
    
    // Estimate gas for minting
    const estimatedGas = 150000n; // Typical gas for NFT minting
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || 30000000000n; // 30 Gwei default
    
    const totalCost = estimatedGas * gasPrice;
    
    return {
      estimatedGas: estimatedGas.toString(),
      gasPriceGwei: (gasPrice / 1000000000n).toString(),
      totalCostMatic: ethers.formatEther(totalCost)
    };
  }
  
  private async saveToDatabase(data: {
    productId: string;
    tokenId: string;
    transactionHash: string;
    ipfsUrl: string;
    ownerAddress: string;
    authenticityScore: number;
  }) {
    // Save to Supabase
    const { error } = await supabase
      .from('nft_certificates')
      .upsert({
        product_id: data.productId,
        token_id: data.tokenId,
        transaction_hash: data.transactionHash,
        ipfs_url: data.ipfsUrl,
        owner_address: data.ownerAddress,
        authenticity_score: data.authenticityScore,
        minted_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error saving to database:', error);
    }
  }
  
  async getCertificateByProductId(productId: string): Promise<any> {
    if (!this.contract) {
      // Return mock data if contract not deployed
      return {
        exists: true,
        authenticityScore: 85,
        tokenId: '1234',
        isValid: true
      };
    }
    
    const [exists, score] = await this.contract.verifyCertificate(productId);
    return {
      exists,
      authenticityScore: score.toString(),
      isValid: exists
    };
  }
  
  async getTotalSupply(): Promise<number> {
    if (!this.contract) {
      return 42; // Mock value
    }
    
    const supply = await this.contract.totalSupply();
    return Number(supply);
  }
}

// Export singleton instance
export const nftMintingService = new NFTMintingService();
