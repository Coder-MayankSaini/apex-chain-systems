import QRCode from 'qrcode';

/**
 * Generate QR code for any product ID
 * @param productId - The product ID to encode
 * @param additionalData - Optional additional data to include
 * @returns Base64 encoded QR code image
 */
export async function generateProductQRCode(
  productId: string,
  additionalData?: {
    timestamp?: string;
    verified?: boolean;
    authenticityScore?: number;
    contractAddress?: string;
    [key: string]: any;
  }
): Promise<string> {
  try {
    // For simple product ID, just encode the ID directly
    // For complex data, stringify the object
    const qrData = additionalData 
      ? JSON.stringify({
          productId,
          timestamp: new Date().toISOString(),
          ...additionalData
        })
      : productId;

    // Generate QR code as data URL (base64 encoded image)
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 2,
      width: 256
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code as SVG string
 */
export async function generateProductQRCodeSVG(
  productId: string,
  additionalData?: object
): Promise<string> {
  try {
    const qrData = {
      productId,
      timestamp: new Date().toISOString(),
      ...additionalData
    };

    const svgString = await QRCode.toString(JSON.stringify(qrData), {
      errorCorrectionLevel: 'M',
      type: 'svg',
      width: 256
    });

    return svgString;
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw new Error('Failed to generate QR code SVG');
  }
}

/**
 * Generate simple QR code with just product ID
 */
export async function generateSimpleProductQR(productId: string): Promise<string> {
  try {
    return await QRCode.toDataURL(productId);
  } catch (error) {
    console.error('Error generating simple QR code:', error);
    throw new Error('Failed to generate simple QR code');
  }
}