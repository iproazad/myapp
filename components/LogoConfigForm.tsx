import React from 'react';
import type { LogoConfig } from '../types';
import { LogoStyle } from '../types';

interface LogoConfigFormProps {
  config: LogoConfig;
  setConfig: React.Dispatch<React.SetStateAction<LogoConfig>>;
  apiKey: string;
  setApiKey: (key: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  usage: { count: number; limit: number };
}

export const LogoConfigForm: React.FC<LogoConfigFormProps> = ({ config, setConfig, apiKey, setApiKey, onSubmit, isLoading, usage }) => {
  
  const handleInputChange = <T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,>(
    e: React.ChangeEvent<T>
  ) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };
  
  const remainingGenerations = usage.limit - usage.count;
  const limitReached = remainingGenerations <= 0;

  return (
    <form onSubmit={onSubmit} className="space-y-6 p-6 bg-slate-800/50 rounded-lg border border-slate-700/50">
      
      {limitReached && (
        <div className="p-4 bg-sky-900/50 border border-sky-700 rounded-md">
            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-2">Daily Limit Reached</label>
            <p className="text-xs text-slate-400 mb-3">
              To continue generating, please enter your own Gemini API Key below.
            </p>
            <input
              type="password"
              id="apiKey"
              name="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key here"
              required
              className="w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              aria-describedby="apiKey-description"
            />
             <p id="apiKey-description" className="mt-2 text-xs text-slate-500">
                Your key is stored only in your browser's local storage.
            </p>
        </div>
      )}


      <div>
        <label htmlFor="style" className="block text-sm font-medium text-slate-300 mb-2">Logo Style</label>
        <select
          id="style"
          name="style"
          value={config.style}
          onChange={handleInputChange}
          className="w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
        >
          {Object.values(LogoStyle).map(style => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="color" className="block text-sm font-medium text-slate-300 mb-2">Primary Color</label>
        <input
          type="text"
          id="color"
          name="color"
          value={config.color}
          onChange={handleInputChange}
          placeholder="e.g., Electric Blue, Chrome Silver"
          className="w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
        />
      </div>

      <div>
        <label htmlFor="text" className="block text-sm font-medium text-slate-300 mb-2">Brand Name / Text</label>
        <input
          type="text"
          id="text"
          name="text"
          value={config.text}
          onChange={handleInputChange}
          placeholder="e.g., Kaar, Apex Motors"
          className="w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
        />
      </div>

      <div>
        <label htmlFor="details" className="block text-sm font-medium text-slate-300 mb-2">Additional Details</label>
        <textarea
          id="details"
          name="details"
          rows={3}
          value={config.details}
          onChange={handleInputChange}
          placeholder="e.g., an abstract phoenix shape, gears integrated, clean lines"
          className="w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading || (limitReached && !apiKey)}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Generating...' : (limitReached && !apiKey ? 'API Key Required' : 'Generate Logos')}
        </button>
        <p className="text-center text-sm text-slate-500 mt-3">
          {limitReached 
            ? 'You have used all free generations for today.'
            : `You have ${remainingGenerations} of ${usage.limit} free generations remaining today.`
          }
        </p>
      </div>
    </form>
  );
};