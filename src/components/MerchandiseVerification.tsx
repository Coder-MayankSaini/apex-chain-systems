import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, XCircle, Loader2, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { visionService } from '@/services/mockVisionService';
import { nftMintingService } from '@/services/nftMintingService';
import QRCode from 'qrcode';

interface VerificationResult {
  authenticityScore: number;
  status: 'authentic' | 'suspicious' | 'fake';
  detectedLabels: string[];
  logoDetected: boolean;
  qrCode?: string;
  tokenId?: string;
  transactionHash?: string;
}

export function MerchandiseVerification() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string>('');

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      setResult(null);
      setError('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1
  });

  const analyzeImage = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError('');

    try {
      // Convert file to base64
      const base64 = await visionService.fileToBase64(file);
      
      // Analyze with Vision API (using mock service)
      const analysis = await visionService.analyzeMerchandiseImage(base64);
      
      // Quick authenticity check
      const { score, status } = await visionService.quickAuthenticityCheck(base64);
      
      setResult({
        authenticityScore: score,
        status,
        detectedLabels: analysis.detectedLabels,
        logoDetected: analysis.logoDetected
      });

    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const mintNFTCertificate = async () => {
    if (!result || result.status === 'fake') return;

    setIsMinting(true);
    setError('');

    try {
      // Connect wallet first
      await nftMintingService.connectWallet();
      
      // Generate unique product ID
      const productId = `F1-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Generate QR code
      const qrData = {
        productId,
        score: result.authenticityScore,
        timestamp: new Date().toISOString(),
        verified: true
      };
      const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData));
      
      // Mint NFT using the service
      const mintResult = await nftMintingService.mintNFTCertificate({
        productId,
        name: `F1 Merchandise #${productId}`,
        description: `Authenticated F1 merchandise with score ${result.authenticityScore}/100`,
        authenticityScore: result.authenticityScore,
        imageUrl: preview,
        detectedLabels: result.detectedLabels,
        qrCode: qrCodeUrl
      });
      
      setResult({
        ...result,
        qrCode: qrCodeUrl,
        tokenId: mintResult.tokenId,
        transactionHash: mintResult.transactionHash
      });

    } catch (err: any) {
      setError(err.message || 'Failed to mint NFT certificate. Please try again.');
      console.error(err);
    } finally {
      setIsMinting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'authentic': return 'text-green-600';
      case 'suspicious': return 'text-yellow-600';
      case 'fake': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return <Badge className="bg-green-600">Authentic</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-600">Needs Review</Badge>;
    return <Badge className="bg-red-600">Likely Counterfeit</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            F1 Merchandise Authentication
          </CardTitle>
          <CardDescription>
            Upload an image of your F1 merchandise to verify its authenticity and mint an NFT certificate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
          >
            <input {...getInputProps()} />
            {preview ? (
              <div className="space-y-4">
                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                <p className="text-sm text-gray-600">Click or drag to replace</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                <p className="text-gray-600">
                  {isDragActive ? 'Drop the image here' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </div>
            )}
          </div>

          {/* Analysis Button */}
          {file && !result && (
            <Button 
              onClick={analyzeImage} 
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Image...
                </>
              ) : (
                'Analyze Authenticity'
              )}
            </Button>
          )}

          {/* Results Section */}
          {result && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Authenticity Score</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getStatusColor(result.status)}`}>
                      {result.authenticityScore}/100
                    </span>
                    {getScoreBadge(result.authenticityScore)}
                  </div>
                </div>
                
                <Progress value={result.authenticityScore} className="h-3" />
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-sm text-gray-600">Logo Detection</p>
                    <div className="flex items-center gap-1">
                      {result.logoDetected ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium">
                        {result.logoDetected ? 'Detected' : 'Not Found'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Labels Found</p>
                    <p className="font-medium">{result.detectedLabels.length} items</p>
                  </div>
                </div>

                {result.detectedLabels.length > 0 && (
                  <div className="pt-2">
                    <p className="text-sm text-gray-600 mb-1">Detected Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {result.detectedLabels.map((label, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mint NFT Button */}
              {result.status !== 'fake' && !result.tokenId && (
                <Button 
                  onClick={mintNFTCertificate}
                  disabled={isMinting}
                  className="w-full"
                  variant={result.status === 'authentic' ? 'default' : 'secondary'}
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Minting NFT Certificate...
                    </>
                  ) : (
                    'Mint NFT Certificate'
                  )}
                </Button>
              )}

              {/* NFT Minted Success */}
              {result.tokenId && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <p className="font-medium text-green-800 mb-2">
                      NFT Certificate Successfully Minted!
                    </p>
                    <div className="space-y-1 text-sm">
                      <p>Token ID: #{result.tokenId}</p>
                      <p className="truncate">
                        Transaction: {result.transactionHash}
                      </p>
                    </div>
                    {result.qrCode && (
                      <div className="mt-3">
                        <p className="text-sm mb-2">Certificate QR Code:</p>
                        <img src={result.qrCode} alt="QR Code" className="w-32 h-32" />
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Counterfeit Warning */}
              {result.status === 'fake' && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <p className="font-medium mb-1">Potential Counterfeit Detected</p>
                    <p className="text-sm">
                      This item does not meet authenticity standards. NFT certificate cannot be issued.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
