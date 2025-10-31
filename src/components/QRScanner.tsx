import React, { useState, useRef, useEffect } from 'react';
import { QrScanner } from '@/utils/qrScannerSetup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Upload, X, QrCode, CheckCircle } from 'lucide-react';

export function QRScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    // Cleanup scanner on unmount
    return () => {
      if (scanner) {
        scanner.destroy();
      }
    };
  }, [scanner]);

  const startCamera = async () => {
    if (!videoRef.current) return;
    
    try {
      setError('');
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('Scanned:', result);
          setScannedData(result.data);
          setIsScanning(false);
          stopCamera();
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      
      setScanner(qrScanner);
      await qrScanner.start();
      setCameraActive(true);
      setIsScanning(true);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (scanner) {
      scanner.stop();
      scanner.destroy();
      setScanner(null);
    }
    setCameraActive(false);
    setIsScanning(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setError('');
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      });
      setScannedData(result.data);
    } catch (err) {
      console.error('Scan error:', err);
      setError('No QR code found in the image. Please try another image.');
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const parseScannedData = (data: string) => {
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(data);
      return (
        <div className="space-y-2">
          <p className="font-semibold">Parsed Data:</p>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        </div>
      );
    } catch {
      // If not JSON, check if it's a URL
      if (data.startsWith('http://') || data.startsWith('https://')) {
        return (
          <div className="space-y-2">
            <p className="font-semibold">URL Detected:</p>
            <a 
              href={data} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {data}
            </a>
          </div>
        );
      }
      
      // Otherwise, treat as plain text (like product ID)
      return (
        <div className="space-y-2">
          <p className="font-semibold">Product ID:</p>
          <p className="text-lg font-mono">{data}</p>
        </div>
      );
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          QR Code Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera View */}
        {cameraActive && (
          <div className="relative">
            <video 
              ref={videoRef} 
              className="w-full rounded-lg"
              style={{ maxHeight: '400px' }}
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={stopCamera}
            >
              <X className="w-4 h-4 mr-1" />
              Stop
            </Button>
          </div>
        )}

        {/* Control Buttons */}
        {!cameraActive && (
          <div className="flex gap-2 flex-wrap">
            <Button onClick={startCamera} disabled={isScanning}>
              <Camera className="w-4 h-4 mr-2" />
              Scan with Camera
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Status Messages */}
        {isScanning && !error && (
          <Alert>
            <AlertDescription>
              Point your camera at a QR code to scan it
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Scanned Result */}
        {scannedData && (
          <div className="border rounded-lg p-4 bg-green-50 border-green-200">
            <div className="flex items-start gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-green-800">QR Code Scanned Successfully!</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Raw Data:</p>
                <code className="block bg-white p-2 rounded text-sm break-all">
                  {scannedData}
                </code>
              </div>
              
              {parseScannedData(scannedData)}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(scannedData);
                }}
              >
                Copy to Clipboard
              </Button>
            </div>
          </div>
        )}

        {/* Test Instructions */}
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Click "Scan with Camera" to scan QR codes live</p>
          <p>• Click "Upload Image" to scan from a saved QR code image</p>
          <p>• Supports product IDs, URLs, and JSON data</p>
        </div>
      </CardContent>
    </Card>
  );
}