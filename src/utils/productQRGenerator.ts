import QRCode from 'qrcode';

/**
 * Generate QR code for product IDs - simplified and tested version
 * @param productId - The product ID to encode
 * @returns Base64 encoded QR code image
 */
export async function generateProductQR(productId: string): Promise<string> {
  try {
    // Generate QR code with simple text (most compatible)
    const qrCodeDataUrl = await QRCode.toDataURL(productId, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 2,
      width: 256,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code with product metadata
 * @param productId - The product ID
 * @param metadata - Additional product information
 * @returns Base64 encoded QR code image
 */
export async function generateProductQRWithMetadata(
  productId: string,
  metadata?: {
    name?: string;
    category?: string;
    authenticityScore?: number;
    verified?: boolean;
    timestamp?: string;
  }
): Promise<string> {
  try {
    const qrData = {
      productId,
      ...metadata,
      timestamp: metadata?.timestamp || new Date().toISOString()
    };
    
    // Generate QR code with JSON data
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'H', // High error correction for complex data
      type: 'image/png',
      margin: 2,
      width: 256
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code with metadata:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code as a file
 * @param productId - The product ID
 * @param filename - Output filename
 */
export async function saveProductQRToFile(
  productId: string,
  filename: string
): Promise<void> {
  try {
    await QRCode.toFile(filename, productId, {
      errorCorrectionLevel: 'M',
      type: 'png',
      width: 256,
      margin: 2
    });
  } catch (error) {
    console.error('Error saving QR code to file:', error);
    throw new Error('Failed to save QR code');
  }
}