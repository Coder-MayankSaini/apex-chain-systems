import axios from 'axios';

const VISION_API_KEY = import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY;
const VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;

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

export class GoogleVisionService {
  /**
   * Analyze F1 merchandise image for authenticity
   */
  async analyzeMerchandiseImage(imageBase64: string): Promise<VisionAnalysisResult> {
    try {
      const requestBody = {
        requests: [
          {
            image: {
              content: imageBase64.replace(/^data:image\/\w+;base64,/, '')
            },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'TEXT_DETECTION', maxResults: 10 },
              { type: 'LOGO_DETECTION', maxResults: 5 },
              { type: 'IMAGE_PROPERTIES', maxResults: 5 },
              { type: 'SAFE_SEARCH_DETECTION' },
              { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
            ]
          }
        ]
      };

      const response = await axios.post(VISION_API_URL, requestBody);
      const visionData = response.data.responses[0];

      return this.processVisionResponse(visionData);
    } catch (error) {
      console.error('Vision API Error:', error);
      throw new Error('Failed to analyze image');
    }
  }

  /**
   * Process Google Vision API response and calculate authenticity score
   */
  private processVisionResponse(visionData: any): VisionAnalysisResult {
    const result: VisionAnalysisResult = {
      authenticityScore: 0,
      detectedLabels: [],
      detectedText: [],
      logoDetected: false,
      colorAnalysis: {
        dominantColors: [],
        matchesF1Palette: false
      },
      qualityIndicators: {
        isBlurry: false,
        lightingQuality: 'fair',
        resolution: 'medium'
      },
      suspiciousIndicators: []
    };

    let scoreFactors = {
      labelScore: 0,
      textScore: 0,
      logoScore: 0,
      colorScore: 0,
      qualityScore: 0
    };

    // Process labels
    if (visionData.labelAnnotations) {
      result.detectedLabels = visionData.labelAnnotations.map((label: any) => label.description);
      
      const f1Keywords = ['racing', 'formula', 'motorsport', 'car', 'automotive', 'sport', 'merchandise', 'apparel', 'clothing'];
      const matchedLabels = result.detectedLabels.filter(label => 
        f1Keywords.some(keyword => label.toLowerCase().includes(keyword))
      );
      
      scoreFactors.labelScore = Math.min((matchedLabels.length / 3) * 30, 30);
    }

    // Process text detection
    if (visionData.textAnnotations) {
      result.detectedText = visionData.textAnnotations.slice(1, 10).map((text: any) => text.description);
      
      const authenticTexts = ['F1', 'Formula 1', 'FIA', 'Official', 'Licensed', 'Authentic'];
      const suspiciousTexts = ['replica', 'copy', 'fake', 'unofficial'];
      
      const hasAuthenticText = result.detectedText.some(text => 
        authenticTexts.some(auth => text.toLowerCase().includes(auth.toLowerCase()))
      );
      
      const hasSuspiciousText = result.detectedText.some(text => 
        suspiciousTexts.some(sus => text.toLowerCase().includes(sus.toLowerCase()))
      );
      
      if (hasAuthenticText) scoreFactors.textScore = 25;
      if (hasSuspiciousText) {
        scoreFactors.textScore = 0;
        result.suspiciousIndicators.push('Suspicious text detected');
      }
    }

    // Process logo detection
    if (visionData.logoAnnotations && visionData.logoAnnotations.length > 0) {
      result.logoDetected = true;
      const f1Logos = visionData.logoAnnotations.filter((logo: any) => 
        logo.description.toLowerCase().includes('f1') || 
        logo.description.toLowerCase().includes('formula')
      );
      
      scoreFactors.logoScore = f1Logos.length > 0 ? 20 : 10;
    }

    // Process color analysis
    if (visionData.imagePropertiesAnnotation?.dominantColors?.colors) {
      const colors = visionData.imagePropertiesAnnotation.dominantColors.colors;
      result.colorAnalysis.dominantColors = colors.slice(0, 3).map((color: any) => 
        `rgb(${Math.round(color.color.red || 0)}, ${Math.round(color.color.green || 0)}, ${Math.round(color.color.blue || 0)})`
      );
      
      // Check for F1 typical colors (red, black, white, silver)
      const hasF1Colors = colors.some((color: any) => {
        const r = color.color.red || 0;
        const g = color.color.green || 0;
        const b = color.color.blue || 0;
        
        // Check for red
        if (r > 150 && g < 100 && b < 100) return true;
        // Check for black
        if (r < 50 && g < 50 && b < 50) return true;
        // Check for white/silver
        if (r > 200 && g > 200 && b > 200) return true;
        
        return false;
      });
      
      result.colorAnalysis.matchesF1Palette = hasF1Colors;
      scoreFactors.colorScore = hasF1Colors ? 15 : 5;
    }

    // Assess image quality
    const assessQuality = () => {
      // Check if image might be blurry (simplified check)
      if (visionData.labelAnnotations) {
        const avgConfidence = visionData.labelAnnotations.reduce((sum: number, label: any) => 
          sum + label.score, 0) / visionData.labelAnnotations.length;
        
        if (avgConfidence < 0.7) {
          result.qualityIndicators.isBlurry = true;
          result.suspiciousIndicators.push('Image quality is poor');
          return 5;
        } else if (avgConfidence < 0.85) {
          result.qualityIndicators.lightingQuality = 'fair';
          result.qualityIndicators.resolution = 'medium';
          return 7;
        } else {
          result.qualityIndicators.lightingQuality = 'good';
          result.qualityIndicators.resolution = 'high';
          return 10;
        }
      }
      return 5;
    };
    
    scoreFactors.qualityScore = assessQuality();

    // Calculate final authenticity score
    result.authenticityScore = Math.round(
      scoreFactors.labelScore +
      scoreFactors.textScore +
      scoreFactors.logoScore +
      scoreFactors.colorScore +
      scoreFactors.qualityScore
    );

    // Add warnings for low scores
    if (result.authenticityScore < 50) {
      result.suspiciousIndicators.push('Low authenticity score - verification recommended');
    }

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
   * Quick authenticity check (simplified version)
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

export const visionService = new GoogleVisionService();
