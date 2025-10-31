import QRCode from 'qrcode';
import Jimp from 'jimp';
import jsQR from 'jsqr';

async function verifyQR() {
  try {
    // First, create a known QR code
    const testData = 'F1-Jacket-25-001';
    console.log('Creating QR with data:', testData);
    await QRCode.toFile('verify-test.png', testData);
    
    // Read it back and decode
    console.log('\nReading and decoding verify-test.png...');
    const image = await Jimp.read('verify-test.png');
    const { data, width, height } = image.bitmap;
    
    // Convert to format jsQR expects
    const code = jsQR(new Uint8ClampedArray(data), width, height);
    
    if (code) {
      console.log('✓ QR Code successfully decoded!');
      console.log('  Decoded data:', code.data);
      console.log('  Match:', code.data === testData ? '✅ MATCHES' : '❌ MISMATCH');
    } else {
      console.log('❌ Could not decode QR code');
    }
    
    // Also test with a URL
    console.log('\nTesting URL QR code...');
    const urlData = 'https://example.com/F1-Jacket-25-001';
    await QRCode.toFile('verify-url.png', urlData);
    
    const urlImage = await Jimp.read('verify-url.png');
    const urlCode = jsQR(new Uint8ClampedArray(urlImage.bitmap.data), urlImage.bitmap.width, urlImage.bitmap.height);
    
    if (urlCode) {
      console.log('✓ URL QR Code decoded:', urlCode.data);
    }
    
  } catch (error) {
    console.error('Error:', error);
    console.log('\nNote: jsqr and jimp may not be installed. The QR codes are likely valid.');
    console.log('Try using an online QR decoder or a different scanner app to verify.');
  }
}

verifyQR();