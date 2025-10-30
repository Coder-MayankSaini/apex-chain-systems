import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
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

export default function Authenticate() {
  const [scannerActive, setScannerActive] = useState(false);
  const [manualSearch, setManualSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (scannerActive) {
      initializeScanner();
    }
    return () => {
      const scanner = document.getElementById('qr-reader');
      if (scanner) {
        scanner.innerHTML = '';
      }
    };
  }, [scannerActive]);

  const initializeScanner = () => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    );

    scanner.render(
      (decodedText) => {
        handleQrScan(decodedText);
        scanner.clear();
        setScannerActive(false);
      },
      (error) => {
        console.log('QR scan error:', error);
      }
    );
  };

  const handleQrScan = async (data: string) => {
    try {
      const qrData = JSON.parse(data);
      await verifyCertificate(qrData.productId || qrData.tokenId);
    } catch (err) {
      setError('Invalid QR code format');
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
        manufacturer: 'Official F1 Store',
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
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (score: number) => {
    if (score >= 70) return <Badge className="bg-green-600">AUTHENTIC</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-600">NEEDS REVIEW</Badge>;
    return <Badge className="bg-red-600">SUSPICIOUS</Badge>;
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white rounded-full shadow-lg">
              <Shield className="w-12 h-12 text-[hsl(var(--f1-flag-red))]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">F1 Merchandise Authentication</h1>
          <p className="text-gray-600">Verify the authenticity of your F1 merchandise</p>
        </div>

        {/* Verification Methods */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Verify Your Product</CardTitle>
            <CardDescription>
              Use QR code scanner or manual search to verify your F1 merchandise NFT certificate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="qr" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="qr">
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Scanner
                </TabsTrigger>
                <TabsTrigger value="manual">
                  <Search className="w-4 h-4 mr-2" />
                  Manual Search
                </TabsTrigger>
              </TabsList>

              <TabsContent value="qr" className="space-y-4">
                {!scannerActive ? (
                  <div className="text-center py-8">
                    <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">
                      Scan the QR code on your F1 merchandise certificate
                    </p>
                    <Button onClick={() => setScannerActive(true)} size="lg">
                      <Camera className="w-4 h-4 mr-2" />
                      Start Scanner
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div id="qr-reader" className="mx-auto"></div>
                    <Button 
                      onClick={() => setScannerActive(false)} 
                      variant="outline" 
                      className="w-full"
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
                  />
                  <Button 
                    onClick={handleManualSearch}
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Example: F1-MERCH-2024-001 or #1234
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Certificate Display */}
        {certificate && (
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {certificate.verified ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                    NFT Certificate Verified
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Product ID: {certificate.productId}
                  </CardDescription>
                </div>
                {getStatusBadge(certificate.authenticityScore)}
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Authenticity Score */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Authenticity Score</span>
                  <span className={`text-2xl font-bold ${getStatusColor(certificate.authenticityScore)}`}>
                    {certificate.authenticityScore}/100
                  </span>
                </div>
                <Progress value={certificate.authenticityScore} className="h-3" />
              </div>

              {/* Certificate Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Token ID</p>
                      <p className="font-mono">#{certificate.tokenId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Minted Date</p>
                      <p className="text-sm">{formatDate(certificate.timestamp)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Manufacturer</p>
                      <p className="text-sm">{certificate.manufacturer}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Logo Verification</p>
                      <div className="flex items-center gap-1">
                        {certificate.logoDetected ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm">
                          {certificate.logoDetected ? 'Official Logo Detected' : 'Logo Not Found'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Current Owner</p>
                      <p className="font-mono text-sm">{truncateAddress(certificate.owner || '')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Transaction Hash</p>
                      <a 
                        href={`https://amoy.polygonscan.com/tx/${certificate.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-blue-600 hover:underline"
                      >
                        {truncateAddress(certificate.transactionHash || '')}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detected Features */}
              {certificate.detectedLabels && certificate.detectedLabels.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Verified Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {certificate.detectedLabels.map((label, i) => (
                      <Badge key={i} variant="secondary">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Blockchain Verification Link */}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(`https://amoy.polygonscan.com/token/${certificate.transactionHash}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Polygon Blockchain
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This verification system uses blockchain technology and AI to ensure authenticity</p>
          <p className="mt-1">Powered by Polygon Network • Google Cloud Vision API</p>
        </div>
      </div>
    </div>
  );
}
