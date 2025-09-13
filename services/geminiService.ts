import { GoogleGenAI } from "@google/genai";

// In this sandboxed environment, the platform provides a key via process.env.API_KEY.
// We will use this key for the rate-limited demo mode.
const DEMO_API_KEY = process.env.API_KEY;

export const generateLogosApi = async (prompt: string, apiKey?: string): Promise<string[]> => {
  const isDemoMode = !apiKey;
  const effectiveApiKey = isDemoMode ? DEMO_API_KEY : apiKey;
  
  if (!effectiveApiKey) {
     if (isDemoMode) {
        // This is the specific error for when the platform-provided demo key is missing.
        throw new Error("The demo API key is not configured. Please provide your own API key to proceed.");
     } else {
        // This error occurs if the user's key is somehow empty, though the UI should prevent this.
        throw new Error("A valid API key is required. Please enter your key and try again.");
     }
  }

  try {
    const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 4,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("The API did not return any images.");
    }
    
    return response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
  } catch (error) {
    console.error("Error generating images with Gemini:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
             throw new Error('The provided API Key is not valid. Please check it and try again.');
        }
        if (error.message.includes('only accessible to billed users')) {
            throw new Error('This feature requires a Google Cloud project with billing enabled. Please set up a billing account for the project associated with your API key.');
        }
        if (error.message.includes('quota')) {
            // This could be triggered by either the demo key or the user's key.
            throw new Error('The API quota for the provided key has been exceeded. If using the demo, please try again tomorrow or enter your own API key.');
        }
        // Pass through our specific, user-friendly errors
        if (error.message.includes('demo API key is not configured') || error.message.includes('valid API key is required')) {
            throw error;
        }
        throw new Error(`Failed to generate logos: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating logos.");
  }
};