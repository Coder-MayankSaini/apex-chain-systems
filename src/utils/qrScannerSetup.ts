import QrScanner from 'qr-scanner';

// Set the worker path for QR Scanner
// The worker file is copied to the public directory
QrScanner.WORKER_PATH = '/qr-scanner-worker.min.js';

export function initQrScanner() {
  // Check if worker path is accessible
  fetch(QrScanner.WORKER_PATH)
    .then(response => {
      if (!response.ok) {
        console.warn('Local QR Scanner worker not found, using CDN fallback');
        QrScanner.WORKER_PATH = 'https://unpkg.com/qr-scanner@1.4.2/qr-scanner-worker.min.js';
      } else {
        console.log('QR Scanner worker loaded successfully from:', QrScanner.WORKER_PATH);
      }
    })
    .catch(() => {
      console.warn('Local QR Scanner worker not accessible, using CDN');
      QrScanner.WORKER_PATH = 'https://unpkg.com/qr-scanner@1.4.2/qr-scanner-worker.min.js';
    });
}

// Initialize on import
initQrScanner();

export { QrScanner };