import React from 'react';

const LoadingIndicator: React.FC = () => (
    <div className="w-full flex justify-start">
        <div className="max-w-xl rounded-lg p-3 shadow-sm bg-white text-brand-dark self-start flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        </div>
    </div>
);

export default LoadingIndicator;
