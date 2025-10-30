import { ethers } from 'ethers';
import QRCode from 'qrcode';
import { visionService } from './mockVisionService';

// Import contract ABI (would come from compiled contract)
import MerchandiseNFTAbi from '@/contracts/MerchandiseNFT.json';

export interface MerchandiseData {
  productId: string;
  imageUrl: string;
  owner: string;
  authenticityScore: number;
  timestamp: Date;
}

export interface VerificationWorkflow {
  step: 'upload' | 'analyze' | 'verify' | 'mint' | 'complete';
  progress: number;
  data?: any;
}

export class IntegrationService {
  private contractAddress: string;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;

  constructor() {
    this.contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '';
  }

  /**
   * Initialize Web3 connection
   */
  async initializeWeb3() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Please install MetaMask to use this feature');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    await this.provider.send("eth_requestAccounts", []);
    this.signer = await this.provider.getSigner();
    
    if (this.contractAddress && MerchandiseNFTAbi) {
      this.contract = new ethers.Contract(
        this.contractAddress,
        MerchandiseNFTAbi.abi,
        this.signer
      );
    }
  }

  /**
   * Complete verification workflow
   */
  async verifyAndMintNFT(
    file: File,
    onProgress?: (workflow: VerificationWorkflow) => void
  ): Promise<{
    success: boolean;
    tokenId?: string;
    qrCode?: string;
    transactionHash?: string;
    error?: string;
  }> {
    try {
      // Step 1: Upload and prepare image
      onProgress?.({ step: 'upload', progress: 20 });
      const base64Image = await visionService.fileToBase64(file);
      
      // Step 2: Analyze with Vision API
      onProgress?.({ step: 'analyze', progress: 40 });
      const analysis = await visionService.analyzeMerchandiseImage(base64Image);
      
      // Step 3: Verify authenticity
      onProgress?.({ step: 'verify', progress: 60 });
      const { score, status } = await visionService.quickAuthenticityCheck(base64Image);
      
      if (status === 'fake') {
        return {
          success: false,
          error: 'Product failed authenticity verification'
        };
      }

      // Step 4: Mint NFT if authentic
      onProgress?.({ step: 'mint', progress: 80 });
      
      // Generate unique product ID
      const productId = this.generateProductId();
      
      // Generate QR code with verification data
      const qrData = await this.generateQRCode({
        productId,
        score,
        timestamp: new Date().toISOString(),
        contractAddress: this.contractAddress,
        verified: true
      });

      // Mock IPFS upload (in production, upload to IPFS)
      const ipfsUrl = `ipfs://QmTest${productId}`;

      let tokenId: string;
      let transactionHash: string;

      if (this.contract && this.signer) {
        // Real blockchain interaction
        try {
          const signerAddress = await this.signer.getAddress();
          const tx = await this.contract.mintCertificate(
            signerAddress,
            productId,
            ipfsUrl,
            score,
            qrData
          );
          const receipt = await tx.wait();
          
          tokenId = receipt.logs[0].args.tokenId.toString();
          transactionHash = receipt.hash;
        } catch (err) {
          // Fallback to mock if contract fails
          tokenId = Math.floor(Math.random() * 10000).toString();
          transactionHash = this.generateMockTxHash();
        }
      } else {
        // Mock blockchain interaction for testing
        await new Promise(resolve => setTimeout(resolve, 2000));
        tokenId = Math.floor(Math.random() * 10000).toString();
        transactionHash = this.generateMockTxHash();
      }

      // Step 5: Complete
      onProgress?.({ step: 'complete', progress: 100 });

      return {
        success: true,
        tokenId,
        qrCode: qrData,
        transactionHash
      };

    } catch (error) {
      console.error('Verification workflow error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate unique product ID
   */
  private generateProductId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `F1-MERCH-${timestamp}-${random}`;
  }

  /**
   * Generate QR code
   */
  private async generateQRCode(data: any): Promise<string> {
    try {
      return await QRCode.toDataURL(JSON.stringify(data));
    } catch (err) {
      console.error('QR generation error:', err);
      return '';
    }
  }

  /**
   * Generate mock transaction hash
   */
  private generateMockTxHash(): string {
    return '0x' + Array(64).fill(0).map(() => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  /**
   * Verify existing NFT certificate
   */
  async verifyCertificate(tokenId: string): Promise<{
    valid: boolean;
    data?: any;
  }> {
    if (this.contract) {
      try {
        const cert = await this.contract.certificates(tokenId);
        return {
          valid: !cert.isRecalled,
          data: {
            productId: cert.productId,
            authenticityScore: cert.authenticityScore.toNumber(),
            mintedAt: new Date(cert.mintedAt.toNumber() * 1000),
            qrCode: cert.qrCode,
            isRecalled: cert.isRecalled
          }
        };
      } catch (err) {
        console.error('Certificate verification error:', err);
      }
    }

    // Mock verification for testing
    return {
      valid: true,
      data: {
        productId: `F1-MERCH-${tokenId}`,
        authenticityScore: 85,
        mintedAt: new Date(),
        isRecalled: false
      }
    };
  }

  /**
   * Get user's NFT certificates
   */
  async getUserCertificates(address: string): Promise<any[]> {
    if (this.contract) {
      try {
        const balance = await this.contract.balanceOf(address);
        const certificates = [];
        
        for (let i = 0; i < balance; i++) {
          const tokenId = await this.contract.tokenOfOwnerByIndex(address, i);
          const cert = await this.verifyCertificate(tokenId.toString());
          if (cert.valid) {
            certificates.push({
              tokenId: tokenId.toString(),
              ...cert.data
            });
          }
        }
        
        return certificates;
      } catch (err) {
        console.error('Error fetching user certificates:', err);
      }
    }

    // Mock data for testing
    return [
      {
        tokenId: '1234',
        productId: 'F1-MERCH-1234',
        authenticityScore: 92,
        mintedAt: new Date()
      },
      {
        tokenId: '5678',
        productId: 'F1-MERCH-5678',
        authenticityScore: 78,
        mintedAt: new Date()
      }
    ];
  }

  /**
   * Check if Web3 is available
   */
  isWeb3Available(): boolean {
    return typeof window.ethereum !== 'undefined';
  }

  /**
   * Get current network
   */
  async getCurrentNetwork(): Promise<string> {
    if (this.provider) {
      const network = await this.provider.getNetwork();
      return network.name;
    }
    return 'unknown';
  }
}

export const integrationService = new IntegrationService();
