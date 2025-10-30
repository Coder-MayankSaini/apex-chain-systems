/**
 * Mock Vision Service for Testing
 * This simulates the Vision API functionality without requiring billing
 */

export interface VisionAnalysisResult {
  authenticityScore: number;
  detectedLabels: string[];
  detectedText: string[];
  logoDetected: boolean;
  colorAnalysis: {
    dominantColors: string[];
    matchesF1Palette: boolean;
  };
  qualityIndicators: {
    isBlurry: boolean;
    lightingQuality: 'poor' | 'fair' | 'good' | 'excellent';
    resolution: 'low' | 'medium' | 'high';
  };
  suspiciousIndicators: string[];
}

export class MockVisionService {
  /**
   * Simulate analyzing F1 merchandise image
   */
  async analyzeMerchandiseImage(imageBase64: string): Promise<VisionAnalysisResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate random but realistic results
    const random = Math.random();
    const isAuthentic = random > 0.3;
    
    const result: VisionAnalysisResult = {
      authenticityScore: Math.floor(random * 100),
      detectedLabels: [
        'Racing',
        'Formula 1',
        'Merchandise',
        'Apparel',
        'Sports equipment'
      ].slice(0, Math.floor(Math.random() * 5) + 1),
      detectedText: isAuthentic ? 
        ['F1', 'Official Licensed Product', '2024 Season'] : 
        ['Replica', 'Unofficial'],
      logoDetected: isAuthentic,
      colorAnalysis: {
        dominantColors: [
          'rgb(255, 0, 0)',   // F1 Red
          'rgb(0, 0, 0)',     // Black
          'rgb(255, 255, 255)' // White
        ],
        matchesF1Palette: isAuthentic
      },
      qualityIndicators: {
        isBlurry: random < 0.1,
        lightingQuality: random > 0.7 ? 'excellent' : random > 0.4 ? 'good' : 'fair',
        resolution: random > 0.6 ? 'high' : 'medium'
      },
      suspiciousIndicators: isAuthentic ? [] : ['Possible counterfeit detected', 'Logo appears modified']
    };
    
    return result;
  }

  /**
   * Convert file to base64
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Quick authenticity check
   */
  async quickAuthenticityCheck(imageBase64: string): Promise<{ score: number; status: 'authentic' | 'suspicious' | 'fake' }> {
    const analysis = await this.analyzeMerchandiseImage(imageBase64);
    
    let status: 'authentic' | 'suspicious' | 'fake';
    if (analysis.authenticityScore >= 70) {
      status = 'authentic';
    } else if (analysis.authenticityScore >= 40) {
      status = 'suspicious';
    } else {
      status = 'fake';
    }

    return {
      score: analysis.authenticityScore,
      status
    };
  }
}

// Export mock service as the main vision service
export const visionService = new MockVisionService();

console.log('⚠️ Using Mock Vision Service - Enable billing for real Vision API');
