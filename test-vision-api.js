import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

dotenv.config();

const VISION_API_KEY = process.env.VITE_GOOGLE_CLOUD_VISION_API_KEY;
const VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;

console.log('🔍 Testing Google Cloud Vision API Integration\n');
console.log('API Key:', VISION_API_KEY ? '✅ Configured' : '❌ Missing');

// Test with a sample F1 merchandise image (using a test image URL)
const testImageUrl = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400'; // Sample car image for testing

async function testVisionAPI() {
  try {
    console.log('\n📸 Fetching test image...');
    
    // For testing, we'll use a simple label detection
    const requestBody = {
      requests: [
        {
          image: {
            source: {
              imageUri: testImageUrl
            }
          },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 5 },
            { type: 'TEXT_DETECTION', maxResults: 5 },
            { type: 'LOGO_DETECTION', maxResults: 3 },
            { type: 'IMAGE_PROPERTIES', maxResults: 3 }
          ]
        }
      ]
    };

    console.log('🌐 Calling Google Vision API...');
    const response = await axios.post(VISION_API_URL, requestBody);
    
    if (response.data.responses && response.data.responses[0]) {
      const visionData = response.data.responses[0];
      
      console.log('\n✅ API Connection Successful!\n');
      console.log('📊 Analysis Results:');
      console.log('=' .repeat(50));
      
      // Display labels
      if (visionData.labelAnnotations) {
        console.log('\n🏷️  Detected Labels:');
        visionData.labelAnnotations.forEach((label, index) => {
          console.log(`   ${index + 1}. ${label.description} (${Math.round(label.score * 100)}% confidence)`);
        });
      }
      
      // Display text
      if (visionData.textAnnotations && visionData.textAnnotations.length > 0) {
        console.log('\n📝 Detected Text:');
        console.log(`   "${visionData.textAnnotations[0].description.substring(0, 100)}..."`);
      } else {
        console.log('\n📝 No text detected in image');
      }
      
      // Display logos
      if (visionData.logoAnnotations && visionData.logoAnnotations.length > 0) {
        console.log('\n🎯 Detected Logos:');
        visionData.logoAnnotations.forEach((logo, index) => {
          console.log(`   ${index + 1}. ${logo.description}`);
        });
      } else {
        console.log('\n🎯 No logos detected');
      }
      
      // Display dominant colors
      if (visionData.imagePropertiesAnnotation?.dominantColors?.colors) {
        console.log('\n🎨 Dominant Colors:');
        const colors = visionData.imagePropertiesAnnotation.dominantColors.colors.slice(0, 3);
        colors.forEach((color, index) => {
          const rgb = `RGB(${Math.round(color.color.red || 0)}, ${Math.round(color.color.green || 0)}, ${Math.round(color.color.blue || 0)})`;
          console.log(`   ${index + 1}. ${rgb} (${Math.round(color.score * 100)}%)`);
        });
      }
      
      // Calculate a sample authenticity score
      console.log('\n🔐 Authenticity Assessment:');
      console.log('=' .repeat(50));
      
      let score = 50; // Base score
      const labels = visionData.labelAnnotations?.map(l => l.description.toLowerCase()) || [];
      
      // Check for relevant keywords
      if (labels.some(l => l.includes('car') || l.includes('vehicle'))) score += 10;
      if (labels.some(l => l.includes('racing') || l.includes('sport'))) score += 15;
      if (labels.some(l => l.includes('automotive'))) score += 10;
      
      console.log(`   Authenticity Score: ${score}/100`);
      console.log(`   Status: ${score >= 70 ? '✅ Likely Authentic' : score >= 40 ? '⚠️ Needs Review' : '❌ Suspicious'}`);
      
      console.log('\n🎉 Phase 3: Google Vision API Integration - SUCCESS!');
      console.log('The API is working and ready to analyze F1 merchandise images.');
      
    } else {
      console.error('❌ No response data from Vision API');
    }
    
  } catch (error) {
    console.error('\n❌ Vision API Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data.error?.message || error.response.data);
      
      if (error.response.status === 400) {
        console.log('\n⚠️  Possible issues:');
        console.log('   - API key might be invalid or expired');
        console.log('   - Vision API might not be enabled for your project');
        console.log('   - Request format might be incorrect');
      } else if (error.response.status === 403) {
        console.log('\n⚠️  Permission denied:');
        console.log('   - Enable Vision API at: https://console.cloud.google.com/apis/library/vision.googleapis.com');
        console.log('   - Check API key restrictions');
      }
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testVisionAPI();
