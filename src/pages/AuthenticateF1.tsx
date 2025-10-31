import React, { useState, useEffect, useRef } from 'react';
import { QrScanner } from '@/utils/qrScannerSetup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  QrCode, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  Hash,
  ExternalLink,
  Loader2,
  Camera,
  Package
} from 'lucide-react';

interface CertificateData {
  productId: string;
  authenticityScore: number;
  tokenId: string;
  timestamp: string;
  verified: boolean;
  manufacturer?: string;
  owner?: string;
  transactionHash?: string;
  detectedLabels?: string[];
  logoDetected?: boolean;
}

export default function AuthenticateF1() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [manualSearch, setManualSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.stop();
        scanner.destroy();
      }
    };
  }, [scanner]);

  const startScanner = async () => {
    if (!videoRef.current) return;
    
    try {
      setError('');
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('Scanned:', result);
          handleQrScan(result.data);
          stopScanner();
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      
      setScanner(qrScanner);
      await qrScanner.start();
      setScannerActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to access camera. Please ensure camera permissions are granted.');
      setScannerActive(false);
    }
  };

  const stopScanner = () => {
    if (scanner) {
      scanner.stop();
      scanner.destroy();
      setScanner(null);
    }
    setScannerActive(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setError('');
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      });
      handleQrScan(result.data);
    } catch (err) {
      console.error('Scan error:', err);
      setError('No QR code found in the image. Please try another image.');
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleQrScan = async (data: string) => {
    try {
      // Try to parse as JSON first
      let searchId = '';
      try {
        const qrData = JSON.parse(data);
        searchId = qrData.productId || qrData.tokenId || '';
      } catch {
        // If not JSON, treat as plain text product ID
        searchId = data;
      }
      
      if (searchId) {
        await verifyCertificate(searchId);
      } else {
        setError('Invalid QR code format - no product ID found');
      }
    } catch (err) {
      console.error('QR scan error:', err);
      setError('Failed to process QR code');
    }
  };

  const handleManualSearch = async () => {
    if (!manualSearch.trim()) {
      setError('Please enter a Product ID or Token ID');
      return;
    }
    await verifyCertificate(manualSearch);
  };

  const verifyCertificate = async (searchId: string) => {
    setIsSearching(true);
    setError('');
    setCertificate(null);

    try {
      // Simulate blockchain/database lookup
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock certificate data (in production, fetch from blockchain/database)
      const mockCertificate: CertificateData = {
        productId: `F1-MERCH-2024-${Math.floor(Math.random() * 1000)}`,
        authenticityScore: 85 + Math.floor(Math.random() * 15),
        tokenId: searchId.startsWith('#') ? searchId.slice(1) : Math.floor(Math.random() * 10000).toString(),
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        manufacturer: 'Official F1® Store',
        owner: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        transactionHash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        detectedLabels: ['Racing', 'Formula 1', 'Official Merchandise', 'Licensed Product'],
        logoDetected: true
      };

      setCertificate(mockCertificate);
    } catch (err) {
      setError('Certificate not found or invalid');
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusBadge = (score: number) => {
    if (score >= 70) return (
      <Badge className="bg-green-600/20 text-green-400 border border-green-600 px-3 py-1 uppercase tracking-wider font-bold">
        ✓ AUTHENTIC
      </Badge>
    );
    if (score >= 40) return (
      <Badge className="bg-yellow-600/20 text-yellow-400 border border-yellow-600 px-3 py-1 uppercase tracking-wider font-bold">
        ⚠ NEEDS REVIEW
      </Badge>
    );
    return (
      <Badge className="bg-red-600/20 text-red-400 border border-red-600 px-3 py-1 uppercase tracking-wider font-bold">
        ✗ SUSPICIOUS
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 f1-grid-bg opacity-20" />
      <div className="absolute top-0 left-0 w-full h-32 checkered-pattern opacity-10" />
      <div className="absolute bottom-0 left-0 w-full h-32 checkered-pattern opacity-10" />
      <div className="absolute inset-0 speed-lines pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 racing-stripes opacity-5 rotate-45" />
      
      <div className="relative max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4 relative">
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="w-32 h-32 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
            </div>
            <div className="relative p-5 bg-gradient-to-br from-red-600 to-red-800 rounded-lg shadow-glow border-2 border-red-500 transform hover:scale-110 transition-all duration-300 animate-racing-pulse">
              <Shield className="w-14 h-14 text-white drop-shadow-2xl" />
            </div>
          </div>
          <h1 className="text-5xl font-heading mb-3 relative">
            <span className="f1-title">F1® MERCHANDISE</span>
          </h1>
          <h2 className="text-2xl font-heading text-white mb-4">AUTHENTICATION SYSTEM</h2>
          <div className="flex items-center justify-center gap-3">
            <div className="h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent w-32 rounded-full" />
            <p className="text-sm uppercase tracking-[0.3em] text-gray-400 font-mono">Verify • Authenticate • Protect</p>
            <div className="h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent w-32 rounded-full" />
          </div>
        </div>

        {/* Verification Methods */}
        <Card className="mb-6 f1-card backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-speed-gradient animate-speed-slide" />
          <CardHeader className="border-b border-red-900/30 bg-black/50">
            <CardTitle className="text-white uppercase tracking-[0.2em] flex items-center justify-center gap-3 text-xl font-heading">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-75" />
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse delay-150" />
              </div>
              VERIFY YOUR PRODUCT
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-150" />
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-75" />
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              </div>
            </CardTitle>
            <CardDescription className="text-gray-400 text-center font-mono text-xs">
              Use QR code scanner or manual search to verify your F1® merchandise NFT certificate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="qr" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/50 border border-gray-800">
                <TabsTrigger value="qr" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Scanner
                </TabsTrigger>
                <TabsTrigger value="manual" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
                  <Search className="w-4 h-4 mr-2" />
                  Manual Search
                </TabsTrigger>
              </TabsList>

              <TabsContent value="qr" className="space-y-4">
                {!scannerActive ? (
                  <div className="text-center py-8">
                    <div className="relative inline-block mb-4">
                      <Camera className="w-16 h-16 text-gray-600" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-ping" />
                    </div>
                    <p className="text-gray-400 mb-4">
                      Scan the QR code on your F1® merchandise certificate
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        onClick={startScanner} 
                        size="lg"
                        className="f1-button text-white px-8 py-6 text-lg"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Start Camera
                      </Button>
                      <Button 
                        onClick={() => fileInputRef.current?.click()} 
                        size="lg" 
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white px-8 py-6 text-lg"
                      >
                        Upload QR Image
                      </Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <video 
                        ref={videoRef} 
                        className="w-full rounded-lg mx-auto border-2 border-red-600"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                    <Button 
                      onClick={stopScanner} 
                      variant="outline" 
                      className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      Cancel Scanning
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter Product ID or Token ID"
                    value={manualSearch}
                    onChange={(e) => setManualSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                    className="bg-black/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-600"
                  />
                  <Button 
                    onClick={handleManualSearch}
                    disabled={isSearching}
                    className="f1-button text-white px-6"
                  >
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500 italic">
                  Example: F1-MERCH-2024-001 or #1234
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 border-red-600/50 bg-red-900/20 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {/* Certificate Display */}
        {certificate && (
          <Card className="f1-card backdrop-blur-md relative overflow-hidden animate-checkered-wave">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-yellow-500 to-red-600 animate-speed-slide" />
            <CardHeader className="bg-gradient-to-r from-black/80 via-gray-900/80 to-black/80 border-b border-red-900/30">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2 text-white">
                    {certificate.verified ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                    <span className="uppercase tracking-wider">NFT Certificate Verified</span>
                  </CardTitle>
                  <CardDescription className="mt-2 text-gray-400 font-mono">
                    Product ID: {certificate.productId}
                  </CardDescription>
                </div>
                {getStatusBadge(certificate.authenticityScore)}
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Authenticity Score */}
              <div className="space-y-3 p-5 bg-gradient-to-br from-black/60 to-gray-900/60 rounded-xl border border-red-900/30 shadow-racing">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-heading text-gray-400 uppercase tracking-[0.2em]">Authenticity Score</span>
                  <span className={`text-4xl font-heading ${getStatusColor(certificate.authenticityScore)} drop-shadow-glow`}>
                    {certificate.authenticityScore}/100
                  </span>
                </div>
                <div className="relative">
                  <Progress value={certificate.authenticityScore} className="h-3 bg-gray-800" />
                  <div className="absolute inset-0 h-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                      style={{ width: `${certificate.authenticityScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-black/30 rounded-lg border border-gray-800">
                    <Hash className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Token ID</p>
                      <p className="font-mono text-white">#{certificate.tokenId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-black/30 rounded-lg border border-gray-800">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Minted Date</p>
                      <p className="text-sm text-white">{formatDate(certificate.timestamp)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-black/30 rounded-lg border border-gray-800">
                    <Package className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Manufacturer</p>
                      <p className="text-sm text-white">{certificate.manufacturer}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-black/30 rounded-lg border border-gray-800">
                    <Shield className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Logo Verification</p>
                      <div className="flex items-center gap-1">
                        {certificate.logoDetected ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm text-white">
                          {certificate.logoDetected ? 'Official Logo Detected' : 'Logo Not Found'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-black/30 rounded-lg border border-gray-800">
                    <ExternalLink className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Current Owner</p>
                      <p className="font-mono text-sm text-white">{truncateAddress(certificate.owner || '')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-black/30 rounded-lg border border-gray-800">
                    <ExternalLink className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Transaction Hash</p>
                      <a 
                        href={`https://amoy.polygonscan.com/tx/${certificate.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-red-500 hover:text-red-400 transition-colors"
                      >
                        {truncateAddress(certificate.transactionHash || '')}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detected Features */}
              {certificate.detectedLabels && certificate.detectedLabels.length > 0 && (
                <div className="p-4 bg-black/50 rounded-lg border border-gray-800">
                  <p className="text-sm font-medium mb-3 text-gray-400 uppercase tracking-wider">Verified Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {certificate.detectedLabels.map((label, i) => (
                      <Badge key={i} className="bg-red-600/20 text-red-400 border border-red-600/50 hover:bg-red-600/30">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Blockchain Verification Link */}
              <div className="pt-4 border-t border-gray-800">
                <Button
                  variant="outline"
                  className="w-full bg-black/50 border-red-600 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-700 uppercase tracking-wider font-bold transition-all"
                  onClick={() => window.open(`https://amoy.polygonscan.com/token/0x5ef281f10a2c4F4b2b83c131a0471633720a8891?a=${certificate.tokenId}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Polygon Blockchain
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center relative">
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="w-64 h-32 bg-red-600/10 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-3 text-xs text-gray-500 uppercase tracking-[0.3em] mb-3 font-mono">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-red-600" />
              <Shield className="w-4 h-4 text-red-600" />
              <span className="text-red-600 font-bold">AUTHENTICATION SYSTEM</span>
              <Shield className="w-4 h-4 text-red-600" />
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-red-600" />
            </div>
            <p className="text-sm text-gray-400 font-mono">BLOCKCHAIN TECHNOLOGY • AI-POWERED VERIFICATION</p>
            <div className="mt-3 flex justify-center items-center gap-4 text-xs text-gray-600">
              <span className="font-mono">Powered by</span>
              <span className="text-purple-400">Polygon Network</span>
              <span className="text-gray-700">•</span>
              <span className="text-blue-400">Google Cloud Vision API</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
