import React from 'react';
import { motion } from 'framer-motion';
import { RasaLogo } from '../components/icons';

interface WelcomePageProps {
    onPromptClick: (prompt: string) => void;
    welcomeMessage: string;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onPromptClick, welcomeMessage }) => {
    const examplePrompt = "What herbal remedies can I use for a sore throat?";
    
    return (
        <motion.div 
            className="h-full flex flex-col justify-center items-center p-6 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="w-full max-w-md">
                <RasaLogo className="h-20 mx-auto mb-6" />

                <div className="bg-brand-beige p-6 rounded-2xl shadow-inner">
                     <h2 className="text-2xl font-bold text-brand-charcoal">Your AI Health Guide</h2>
                     <p className="mt-2 text-brand-charcoal">
                        {welcomeMessage}
                    </p>
                </div>
                
                <p className="text-sm text-brand-charcoal/70 mt-8 mb-2">Try asking something like:</p>

                <button 
                    onClick={() => onPromptClick(examplePrompt)}
                    className="w-full p-4 bg-brand-yellow rounded-2xl text-brand-brown font-semibold hover:bg-opacity-90 transition-colors shadow-md"
                >
                    "{examplePrompt}"
                </button>
            </div>
        </motion.div>
    );
};

export default WelcomePage;