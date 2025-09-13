import React, { useState, useEffect } from 'react';
import type { LogoConfig } from './types';
import { LogoStyle } from './types';
import { generateLogosApi } from './services/geminiService';
import { Header } from './components/Header';
import { LogoConfigForm } from './components/LogoConfigForm';
import { LogoDisplay } from './components/LogoDisplay';

const USAGE_STORAGE_KEY = 'kaar-logo-usage';
const DAILY_LIMIT = 5;

function App() {
  const [config, setConfig] = useState<LogoConfig>({
    style: LogoStyle.MODERN,
    color: 'Electric Blue and Carbon Fiber Black',
    text: 'Kaar',
    details: 'Sleek and dynamic feel',
  });
  const [apiKey, setApiKey] = useState<string>('');
  const [generatedLogos, setGeneratedLogos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState({ count: 0, limit: DAILY_LIMIT });

  
  // Load API key and usage from local storage on initial render
  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    
    const storedUsage = localStorage.getItem(USAGE_STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    if (storedUsage) {
      try {
        const parsedUsage = JSON.parse(storedUsage);
        if (parsedUsage.date === today) {
          setUsage({ count: parsedUsage.count, limit: DAILY_LIMIT });
        } else {
          // It's a new day, reset the count
          localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));
          setUsage({ count: 0, limit: DAILY_LIMIT });
        }
      } catch {
        // Corrupted data, reset it
        localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));
      }
    } else {
        // No usage data found, initialize it
        localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));
    }
  }, []);

  // Save API key to local storage whenever it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('gemini-api-key', apiKey);
    }
  }, [apiKey]);


  const handleGenerateLogos = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const limitReached = usage.count >= usage.limit;

    // If limit is reached, an API key is now required.
    if (limitReached && !apiKey.trim()) {
      setError('You have reached the daily free limit. Please enter your Gemini API Key to continue.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedLogos([]);

    const prompt = `
      Create a professional, high-resolution, vector-style logo for an automotive brand named "${config.text}".
      The logo must be on a clean, solid, light-colored background (like #f0f0f0), not a photo.
      
      Key characteristics:
      - Style: ${config.style}
      - Primary Color Scheme: ${config.color}
      - Core Concept: An emblem or logomark suitable for a car badge.
      - Do not include extra descriptive text like 'logo' or 'vector' in the image itself. The only text should be the brand name, if requested.
      - Additional details: ${config.details}.
      - The output should be a clean, commercial-ready brand mark.
    `;

    try {
      // Pass the user's API key only if the limit is reached, otherwise use the demo key internally.
      const logos = await generateLogosApi(prompt, limitReached ? apiKey : undefined);
      setGeneratedLogos(logos);

      // On success, update usage count only if it was a free generation
      if (!limitReached) {
        const newCount = usage.count + 1;
        const today = new Date().toISOString().split('T')[0];
        setUsage(prev => ({ ...prev, count: newCount }));
        localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify({ date: today, count: newCount }));
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <LogoConfigForm
              config={config}
              setConfig={setConfig}
              apiKey={apiKey}
              setApiKey={setApiKey}
              onSubmit={handleGenerateLogos}
              isLoading={isLoading}
              usage={usage}
            />
          </div>
          <div className="lg:col-span-2">
            <LogoDisplay
              logos={generatedLogos}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </main>
      <footer className="text-center p-4 mt-8 text-slate-500 text-sm">
        <p>Powered by Gemini. Designed for Kaar.</p>
      </footer>
    </div>
  );
}

export default App;
