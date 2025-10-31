import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, QrCode } from 'lucide-react';
import { generateProductQRCode, generateSimpleProductQR } from '@/utils/qrCodeGenerator';

export function QRCodeGenerator() {
  const [productId, setProductId] = useState('');
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleGenerateQR = async () => {
    if (!productId.trim()) return;
    
    setLoading(true);
    try {
      // Generate QR with additional data
      const qrDataUrl = await generateProductQRCode(productId, {
        verified: true,
        generatedBy: 'Apex Chain System'
      });
      setQrCode(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qr-${productId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          QR Code Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="productId">Product ID</Label>
          <Input
            id="productId"
            type="text"
            placeholder="Enter product ID (e.g., PROD-12345)"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={handleGenerateQR}
          disabled={!productId.trim() || loading}
          className="w-full"
        >
          Generate QR Code
        </Button>

        {qrCode && (
          <div className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <img src={qrCode} alt="QR Code" className="max-w-[256px]" />
            </div>
            
            <Button
              variant="outline"
              onClick={handleDownload}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download QR Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}