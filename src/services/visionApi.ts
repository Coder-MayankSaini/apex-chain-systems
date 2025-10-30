import axios from 'axios';

// Google Cloud Vision API configuration
const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

// You'll need to get this from Google Cloud Console
const API_KEY = process.env.VITE_GOOGLE_VISION_API_KEY || '';

interface VisionApiRequest {
  image: {
    content?: string; // Base64 encoded image
    source?: {
      imageUri?: string; // URL to image
      gcsImageUri?: string; // Google Cloud Storage URI
    };
  };
  features: Array<{
    type: string;
    maxResults?: number;
  }>;
}

// Feature types available in Vision API
export const VisionFeatures = {
  TEXT_DETECTION: 'TEXT_DETECTION',
  DOCUMENT_TEXT_DETECTION: 'DOCUMENT_TEXT_DETECTION',
  FACE_DETECTION: 'FACE_DETECTION',
  LANDMARK_DETECTION: 'LANDMARK_DETECTION',
  LOGO_DETECTION: 'LOGO_DETECTION',
  LABEL_DETECTION: 'LABEL_DETECTION',
  SAFE_SEARCH_DETECTION: 'SAFE_SEARCH_DETECTION',
  IMAGE_PROPERTIES: 'IMAGE_PROPERTIES',
  CROP_HINTS: 'CROP_HINTS',
  WEB_DETECTION: 'WEB_DETECTION',
  PRODUCT_SEARCH: 'PRODUCT_SEARCH',
  OBJECT_LOCALIZATION: 'OBJECT_LOCALIZATION',
} as const;

export class VisionApiService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || API_KEY;
    if (!this.apiKey) {
      console.warn('Google Vision API key is not set. Please set VITE_GOOGLE_VISION_API_KEY in your .env file');
    }
  }

  /**
   * Convert file to base64 string
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:image/png;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Analyze image with specified features
   */
  async analyzeImage(
    imageSource: string | File,
    features: Array<{ type: string; maxResults?: number }>
  ) {
    if (!this.apiKey) {
      throw new Error('API key is required. Please set VITE_GOOGLE_VISION_API_KEY');
    }

    let imageContent: VisionApiRequest['image'];

    if (typeof imageSource === 'string') {
      // If it's a URL
      if (imageSource.startsWith('http') || imageSource.startsWith('gs://')) {
        imageContent = {
          source: {
            imageUri: imageSource.startsWith('gs://') ? undefined : imageSource,
            gcsImageUri: imageSource.startsWith('gs://') ? imageSource : undefined,
          },
        };
      } else {
        // Assume it's already base64
        imageContent = { content: imageSource };
      }
    } else {
      // It's a File object
      const base64 = await this.fileToBase64(imageSource);
      imageContent = { content: base64 };
    }

    const request: VisionApiRequest = {
      image: imageContent,
      features,
    };

    try {
      const response = await axios.post(
        `${VISION_API_URL}?key=${this.apiKey}`,
        {
          requests: [request],
        }
      );

      return response.data.responses[0];
    } catch (error) {
      console.error('Vision API Error:', error);
      throw error;
    }
  }

  /**
   * Detect text in image (OCR)
   */
  async detectText(imageSource: string | File) {
    return this.analyzeImage(imageSource, [
      { type: VisionFeatures.TEXT_DETECTION },
    ]);
  }

  /**
   * Detect labels/objects in image
   */
  async detectLabels(imageSource: string | File, maxResults = 10) {
    return this.analyzeImage(imageSource, [
      { type: VisionFeatures.LABEL_DETECTION, maxResults },
    ]);
  }

  /**
   * Detect faces in image
   */
  async detectFaces(imageSource: string | File) {
    return this.analyzeImage(imageSource, [
      { type: VisionFeatures.FACE_DETECTION },
    ]);
  }

  /**
   * Detect landmarks in image
   */
  async detectLandmarks(imageSource: string | File) {
    return this.analyzeImage(imageSource, [
      { type: VisionFeatures.LANDMARK_DETECTION },
    ]);
  }

  /**
   * Detect logos in image
   */
  async detectLogos(imageSource: string | File) {
    return this.analyzeImage(imageSource, [
      { type: VisionFeatures.LOGO_DETECTION },
    ]);
  }

  /**
   * Safe search detection
   */
  async detectSafeSearch(imageSource: string | File) {
    return this.analyzeImage(imageSource, [
      { type: VisionFeatures.SAFE_SEARCH_DETECTION },
    ]);
  }

  /**
   * Web detection - find similar images on the web
   */
  async detectWeb(imageSource: string | File) {
    return this.analyzeImage(imageSource, [
      { type: VisionFeatures.WEB_DETECTION },
    ]);
  }

  /**
   * Object localization - detect and locate multiple objects
   */
  async detectObjects(imageSource: string | File, maxResults = 10) {
    return this.analyzeImage(imageSource, [
      { type: VisionFeatures.OBJECT_LOCALIZATION, maxResults },
    ]);
  }
}

// Export singleton instance
export const visionApi = new VisionApiService();