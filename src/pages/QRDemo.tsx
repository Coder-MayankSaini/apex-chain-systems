import React, { useState } from 'react';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { QRScanner } from '@/components/QRScanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function QRDemo() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">QR Code Tools</h1>
      
      <Tabs defaultValue="generate" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate QR</TabsTrigger>
          <TabsTrigger value="scan">Scan QR</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="mt-6">
          <QRCodeGenerator />
        </TabsContent>
        
        <TabsContent value="scan" className="mt-6">
          <QRScanner />
        </TabsContent>
      </Tabs>

      <div className="mt-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">How it works:</h2>
        <div className="space-y-4 text-gray-600">
          <div>
            <h3 className="font-semibold text-gray-800">Generating QR Codes:</h3>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Enter any product ID (e.g., "F1-Jacket-25-001")</li>
              <li>Click "Generate QR Code" to create the QR image</li>
              <li>Download the QR code for printing or sharing</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800">Scanning QR Codes:</h3>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Use your camera to scan QR codes in real-time</li>
              <li>Or upload an image file containing a QR code</li>
              <li>The scanner will automatically detect and decode the data</li>
              <li>Supports product IDs, URLs, and JSON data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRDemo;