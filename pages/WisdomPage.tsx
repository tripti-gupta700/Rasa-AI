import React from 'react';
import { motion } from 'framer-motion';
import { renderMarkdown } from '../utils/helpers';
import { ScrollIcon } from '../components/icons';

interface WisdomPageProps {
    wisdom: string | null;
    season: string;
}

const WisdomPage: React.FC<WisdomPageProps> = ({ wisdom, season }) => {
    return (
        <div className="h-full bg-cream">
            <div className="p-6 sm:p-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center text-brand-brown mb-2">
                        <ScrollIcon />
                        <h2 className="text-3xl font-bold ml-2">Ayurveda</h2>
                    </div>
                    <p className="text-xl font-semibold text-brand-charcoal mb-6">A Guide for the {season} Season</p>
                    
                    <div className="min-h-[20rem] bg-brand-beige p-6 rounded-2xl">
                        {wisdom ? (
                            <div className="text-brand-charcoal leading-relaxed space-y-4" dangerouslySetInnerHTML={renderMarkdown(wisdom)} />
                        ) : (
                             <div className="flex justify-center items-center h-48">
                                <div className="w-3 h-3 bg-brand-sienna rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="w-3 h-3 bg-brand-sienna rounded-full animate-pulse [animation-delay:-0.15s] mx-2"></div>
                                <div className="w-3 h-3 bg-brand-sienna rounded-full animate-pulse"></div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default WisdomPage;
