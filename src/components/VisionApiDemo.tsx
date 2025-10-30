import React, { useState } from 'react';
import { visionApi, VisionFeatures } from '../services/visionApi';

interface AnalysisResult {
  textAnnotations?: any[];
  labelAnnotations?: any[];
  faceAnnotations?: any[];
  logoAnnotations?: any[];
  landmarkAnnotations?: any[];
  safeSearchAnnotation?: any;
  webDetection?: any;
  localizedObjectAnnotations?: any[];
}

export const VisionApiDemo: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    VisionFeatures.LABEL_DETECTION,
  ]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImageUrl(''); // Clear URL if file is selected
      setError('');
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setSelectedFile(null); // Clear file if URL is entered
    setError('');
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const analyzeImage = async () => {
    if (!selectedFile && !imageUrl) {
      setError('Please select an image file or provide an image URL');
      return;
    }

    if (selectedFeatures.length === 0) {
      setError('Please select at least one analysis feature');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const imageSource = selectedFile || imageUrl;
      const features = selectedFeatures.map(type => ({ type, maxResults: 10 }));
      const response = await visionApi.analyzeImage(imageSource, features);
      setResults(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Google Cloud Vision API Demo</h2>

      {/* Image Input Section */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Upload Image File
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Or Enter Image URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={handleUrlChange}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Feature Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Select Analysis Features</h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(VisionFeatures).map(([key, value]) => (
            <label key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedFeatures.includes(value)}
                onChange={() => toggleFeature(value)}
                className="rounded text-blue-600"
              />
              <span className="text-sm">{key.replace(/_/g, ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={analyzeImage}
        disabled={loading || (!selectedFile && !imageUrl)}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Analyzing...' : 'Analyze Image'}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="mt-6 space-y-6">
          <h3 className="text-xl font-semibold">Analysis Results</h3>

          {/* Text Detection */}
          {results.textAnnotations && results.textAnnotations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Detected Text:</h4>
              <p className="p-3 bg-gray-50 rounded">{results.textAnnotations[0].description}</p>
            </div>
          )}

          {/* Labels */}
          {results.labelAnnotations && results.labelAnnotations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Labels:</h4>
              <ul className="space-y-1">
                {results.labelAnnotations.map((label, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{label.description}</span>
                    <span className="text-gray-500">
                      {(label.score * 100).toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Faces */}
          {results.faceAnnotations && results.faceAnnotations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">
                Faces Detected: {results.faceAnnotations.length}
              </h4>
              {results.faceAnnotations.map((face, idx) => (
                <div key={idx} className="mb-2">
                  <p>Face {idx + 1}:</p>
                  <ul className="ml-4 text-sm">
                    <li>Joy: {face.joyLikelihood}</li>
                    <li>Sorrow: {face.sorrowLikelihood}</li>
                    <li>Anger: {face.angerLikelihood}</li>
                    <li>Surprise: {face.surpriseLikelihood}</li>
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Landmarks */}
          {results.landmarkAnnotations && results.landmarkAnnotations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Landmarks:</h4>
              <ul>
                {results.landmarkAnnotations.map((landmark, idx) => (
                  <li key={idx}>{landmark.description}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Logos */}
          {results.logoAnnotations && results.logoAnnotations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Logos:</h4>
              <ul>
                {results.logoAnnotations.map((logo, idx) => (
                  <li key={idx}>{logo.description}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Safe Search */}
          {results.safeSearchAnnotation && (
            <div>
              <h4 className="font-semibold mb-2">Safe Search:</h4>
              <ul className="text-sm">
                <li>Adult: {results.safeSearchAnnotation.adult}</li>
                <li>Violence: {results.safeSearchAnnotation.violence}</li>
                <li>Medical: {results.safeSearchAnnotation.medical}</li>
                <li>Racy: {results.safeSearchAnnotation.racy}</li>
              </ul>
            </div>
          )}

          {/* Objects */}
          {results.localizedObjectAnnotations && results.localizedObjectAnnotations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Objects:</h4>
              <ul>
                {results.localizedObjectAnnotations.map((obj, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{obj.name}</span>
                    <span className="text-gray-500">
                      {(obj.score * 100).toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Raw JSON (for debugging) */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-600">
              View Raw Response
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};