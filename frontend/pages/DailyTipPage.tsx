import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RasaLogo } from '../components/icons';
import { DailyTipData } from '../types';

interface DailyTipPageProps {
    tipData: DailyTipData | null;
}

const DailyTipPage: React.FC<DailyTipPageProps> = ({ tipData }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-cream">
            <motion.div 
                className="bg-brand-beige p-8 rounded-2xl shadow-lg max-w-2xl w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center justify-center text-brand-brown mb-4">
                    <RasaLogo className="h-10 w-auto" />
                    <h2 className="text-3xl font-bold ml-2">Daily Tip</h2>
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tipData ? tipData.tip : 'loading'}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="min-h-[10rem] flex items-center justify-center"
                    >
                        {tipData ? (
                            <p className="text-lg text-brand-charcoal leading-relaxed">
                                {tipData.tip}
                            </p>
                        ) : (
                             <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-brand-sienna rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-brand-sienna rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-brand-sienna rounded-full animate-pulse"></div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
                
                {tipData && tipData.images.length > 0 && (
                     <div className="mt-8 border-t border-brand-yellow/50 pt-6">
                        <h3 className="text-xl font-bold text-brand-charcoal mb-4">Key Ingredients</h3>
                        <div className="flex justify-center items-center gap-4 flex-wrap">
                            {tipData.images.map((img, index) => (
                                <motion.div 
                                    key={index}
                                    className="text-center"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 * index, duration: 0.4}}
                                >
                                    <div className="w-32 h-32 rounded-full overflow-hidden shadow-md border-4 border-white bg-white flex items-center justify-center">
                                       <img src={`data:image/jpeg;base64,${img.base64}`} alt={img.ingredient} className="w-full h-full object-cover"/>
                                    </div>
                                    <p className="mt-2 font-semibold text-brand-brown">{img.ingredient}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default DailyTipPage;