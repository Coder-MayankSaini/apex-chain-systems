import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Upload, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Shield,
  Link2,
  Wallet,
  Image as ImageIcon
} from 'lucide-react';
import { visionService } from '@/services/mockVisionService';
import { nftMintingService } from '@/services/nftMintingService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/hooks/useWeb3';
import QRCode from 'qrcode';

interface EnhancedProductRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface RegistrationStep {
  step: 'details' | 'image' | 'verify' | 'mint' | 'complete';
  progress: number;
}

export function EnhancedProductRegistration({ isOpen, onClose, onSuccess }: EnhancedProductRegistrationProps) {
  const [step, setStep] = useState<RegistrationStep>({ step: 'details', progress: 25 });
  const [productData, setProductData] = useState({
    productId: '',
    name: '',
    description: '',
    manufacturer: 'Official F1 Store'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [authenticityScore, setAuthenticityScore] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [nftDetails, setNftDetails] = useState<any>(null);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { account } = useWeb3();

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
      setStep({ step: 'image', progress: 50 });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1
  });

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productData.productId || !productData.name) {
      setError('Please fill in all required fields');
      return;
    }
    setProductData({
      ...productData,
      productId: productData.productId || `F1-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    });
    setStep({ step: 'image', progress: 50 });
  };

  const handleImageVerification = async () => {
    if (!imageFile) return;

    setIsProcessing(true);
    setError('');
    setStep({ step: 'verify', progress: 75 });

    try {
      // Convert to base64 and analyze
      const base64 = await visionService.fileToBase64(imageFile);
      const analysis = await visionService.analyzeMerchandiseImage(base64);
      const { score } = await visionService.quickAuthenticityCheck(base64);
      
      setAuthenticityScore(score);

      if (score < 70) {
        setError('Product does not meet authenticity threshold (70/100). NFT cannot be minted.');
        setIsProcessing(false);
        return;
      }

      // Auto-proceed to minting if authentic
      await mintNFT(score, analysis.detectedLabels);
    } catch (err) {
      setError('Failed to verify image. Please try again.');
      console.error(err);
      setIsProcessing(false);
    }
  };

  const mintNFT = async (score: number, labels: string[]) => {
    setStep({ step: 'mint', progress: 90 });

    try {
      // Connect wallet
      const walletAddress = await nftMintingService.connectWallet();
      
      // Generate QR code
      const qrData = {
        productId: productData.productId,
        score,
        timestamp: new Date().toISOString(),
        verified: true
      };
      const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData));

      // Mint NFT
      const mintResult = await nftMintingService.mintNFTCertificate({
        productId: productData.productId,
        name: productData.name,
        description: productData.description,
        authenticityScore: score,
        imageUrl: imagePreview,
        detectedLabels: labels,
        qrCode: qrCodeUrl
      });

      setNftDetails({
        ...mintResult,
        qrCode: qrCodeUrl,
        walletAddress
      });

      // Save to database
      await saveToDatabase(mintResult, score, qrCodeUrl);
      
      setStep({ step: 'complete', progress: 100 });
      setIsProcessing(false);

      toast({
        title: "NFT Certificate Minted! 🏁",
        description: `Token #${mintResult.tokenId} created successfully`,
      });

    } catch (err: any) {
      setError(err.message || 'Failed to mint NFT. Please try again.');
      setIsProcessing(false);
    }
  };

  const saveToDatabase = async (mintResult: any, score: number, qrCode: string) => {
    const { error } = await supabase
      .from('products')
      .insert({
        product_id: productData.productId,
        name: productData.name,
        description: productData.description,
        manufacturer_address: account || '0x0',
        current_owner_address: account || '0x0',
        authenticity_hash: crypto.randomUUID(),
        blockchain_token_id: mintResult.tokenId,
        status: 'manufactured',
        verified: true,
        authenticity_score: score,
        qr_code: qrCode,
        ipfs_url: mintResult.ipfsUrl,
        transaction_hash: mintResult.transactionHash
      });

    if (error) {
      console.error('Database save error:', error);
    }
  };

  const resetForm = () => {
    setStep({ step: 'details', progress: 25 });
    setProductData({
      productId: '',
      name: '',
      description: '',
      manufacturer: 'Official F1 Store'
    });
    setImageFile(null);
    setImagePreview('');
    setAuthenticityScore(0);
    setNftDetails(null);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleComplete = () => {
    resetForm();
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Enhanced Product Registration with NFT
          </DialogTitle>
          <DialogDescription>
            Register your F1 merchandise with automatic NFT certificate minting
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={step.progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Details</span>
            <span>Image</span>
            <span>Verify</span>
            <span>Mint</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        {step.step === 'details' && (
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productId">Product ID (optional)</Label>
              <Input
                id="productId"
                placeholder="Auto-generated if left empty"
                value={productData.productId}
                onChange={(e) => setProductData({ ...productData, productId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="F1 Racing Jacket"
                value={productData.name}
                onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Official F1 merchandise..."
                value={productData.description}
                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Next: Upload Image
            </Button>
          </form>
        )}

        {step.step === 'image' && (
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <input {...getInputProps()} />
              {imagePreview ? (
                <div className="space-y-3">
                  <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                  <p className="text-sm text-gray-600">Click or drag to replace</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 mx-auto text-gray-400" />
                  <p className="text-gray-600">
                    {isDragActive ? 'Drop the image here' : 'Upload product image for verification'}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
            
            {imageFile && (
              <Button onClick={handleImageVerification} className="w-full" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying & Minting...
                  </>
                ) : (
                  'Verify & Mint NFT'
                )}
              </Button>
            )}
          </div>
        )}

        {(step.step === 'verify' || step.step === 'mint') && isProcessing && (
          <div className="text-center py-8 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <div>
              <p className="font-medium">
                {step.step === 'verify' ? 'Analyzing Image...' : 'Minting NFT Certificate...'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {step.step === 'verify' 
                  ? 'Using AI to verify authenticity' 
                  : 'Creating blockchain certificate'}
              </p>
            </div>
          </div>
        )}

        {step.step === 'complete' && nftDetails && (
          <div className="space-y-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900">Registration Complete!</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Your F1 merchandise has been registered with NFT certificate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <span className="text-sm font-medium">Authenticity Score</span>
                <Badge className="bg-green-600">{authenticityScore}/100</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <span className="text-sm font-medium">NFT Token ID</span>
                <span className="font-mono text-sm">#{nftDetails.tokenId}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <span className="text-sm font-medium">Transaction</span>
                <a
                  href={`https://amoy.polygonscan.com/tx/${nftDetails.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  View on Explorer
                  <Link2 className="w-3 h-3" />
                </a>
              </div>
              
              {nftDetails.qrCode && (
                <div className="text-center pt-2">
                  <p className="text-sm font-medium mb-2">QR Code for Verification</p>
                  <img src={nftDetails.qrCode} alt="QR Code" className="w-32 h-32 mx-auto" />
                </div>
              )}
            </div>

            <Button onClick={handleComplete} className="w-full">
              Complete Registration
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
