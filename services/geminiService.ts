import { GoogleGenAI } from "@google/genai";

// In this sandboxed environment, the platform provides a key via process.env.API_KEY.
// We will use this key for the rate-limited demo mode.
const DEMO_API_KEY = process.env.API_KEY;

export const generateLogosApi = async (prompt: string, apiKey?: string): Promise<string[]> => {
  // Use the user's API key if provided (after limit is reached), otherwise use the demo key.
  const effectiveApiKey = apiKey || DEMO_API_KEY;
  
  if (!effectiveApiKey) {
     // This error message is a fallback. It will be shown if the demo key is not available
     // AND the user has not provided their own key.
     throw new Error("Application is not configured correctly. No API key is available.");
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
        throw new Error(`Failed to generate logos: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating logos.");
  }
};