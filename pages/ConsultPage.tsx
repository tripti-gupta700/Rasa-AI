import React from 'react';
import { HandshakeIcon } from '../components/icons';

const ConsultPage: React.FC = () => {
    const handleComingSoon = () => alert('This feature is coming soon!');

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-cream">
            <div className="w-full max-w-md text-brand-charcoal bg-brand-beige p-8 rounded-2xl shadow-lg">
                <div className="flex justify-center text-brand-teal-dark">
                     <HandshakeIcon />
                </div>
                <h2 className="text-3xl font-bold mt-4">Consult an Expert</h2>
                <p className="mt-2 text-brand-charcoal/80">
                    Connect with certified Ayurvedic experts for personalized consultations. This feature is currently in development.
                </p>
                <div className="mt-8 space-y-4 border-t border-brand-yellow/50 pt-6">
                    <h3 className="text-xl font-bold text-brand-charcoal">Health Scheme Integrations</h3>
                    <p className="text-sm text-brand-charcoal/70">We are working to integrate with national health services.</p>
                     <button
                        onClick={handleComingSoon}
                        className="w-full py-3 px-4 bg-brand-teal text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors"
                    >
                        Check Ayushman Bharat Eligibility
                    </button>
                    <button
                        onClick={handleComingSoon}
                        className="w-full py-3 px-4 bg-brand-teal text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors"
                    >
                        Find a Govt. Health Center (PHC)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConsultPage;