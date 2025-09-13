import React from 'react';

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center h-full">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-400"></div>
  </div>
);

const Alert: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md relative" role="alert">
    <strong className="font-bold">Error: </strong>
    <span className="block sm:inline">{message}</span>
  </div>
);

const BillingErrorAlert: React.FC = () => (
    <div className="bg-amber-900/50 border border-amber-700 text-amber-200 p-6 rounded-lg text-center" role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 14v3m-4.5-4.5H6.343a1 1 0 01-1-1V6.343a1 1 0 011-1H7.5m11 11H17.657a1 1 0 011 1v2.157a1 1 0 01-1 1H16.5m-5 0h.01" />
        </svg>
        <h3 className="text-xl font-bold text-amber-300 mb-2">Action Required: Enable Billing</h3>
        <p className="mb-4">
            To use Google's advanced Imagen API for logo generation, your Google Cloud project must have a billing account enabled. This is a standard requirement for high-demand AI services.
        </p>
        <a
            href="https://console.cloud.google.com/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-amber-600 text-white font-bold py-2 px-6 rounded-md hover:bg-amber-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-500"
        >
            Go to Google Cloud Billing
        </a>
    </div>
);


const LogoCard: React.FC<{ src: string, index: number }> = ({ src, index }) => (
    <div className="group relative aspect-square bg-slate-800 rounded-lg overflow-hidden border border-slate-700/50 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/20 hover:border-sky-500">
        <img src={src} alt={`Generated Logo ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <a
                href={src}
                download={`kaar-logo-${index + 1}.png`}
                className="py-2 px-4 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors text-sm font-semibold"
            >
                Download
            </a>
        </div>
    </div>
);

interface LogoDisplayProps {
  logos: string[];
  isLoading: boolean;
  error: string | null;
}

export const LogoDisplay: React.FC<LogoDisplayProps> = ({ logos, isLoading, error }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
            <Spinner />
            <p className="mt-4 text-lg">Generating your masterpiece...</p>
            <p className="text-sm">This may take a moment.</p>
        </div>
      );
    }

    if (error) {
        // Check for the specific billing error message
        if (error.includes('billing enabled')) {
            return <BillingErrorAlert />;
        }
      return <Alert message={error} />;
    }

    if (logos.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {logos.map((logoSrc, index) => (
            <LogoCard key={index} src={logoSrc} index={index} />
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-8 border-2 border-dashed border-slate-700 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-xl font-semibold text-slate-300">Your logos will appear here</h3>
        <p>Fill out the form to generate your brand's new look.</p>
      </div>
    );
  };
  
  return (
    <div className="p-6 bg-slate-900 rounded-lg min-h-[400px] md:min-h-0">
      {renderContent()}
    </div>
  );
};