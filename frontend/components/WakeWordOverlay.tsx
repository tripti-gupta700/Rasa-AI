import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MicIcon } from './icons';
import { WakeWordState } from '../hooks/useWakeWord';

interface WakeWordOverlayProps {
    state: WakeWordState;
}

const WakeWordOverlay: React.FC<WakeWordOverlayProps> = ({ state }) => {
    const isVisible = state === 'AWAKE' || state === 'LISTENING';

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-[100]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-brand-beige p-8 rounded-full shadow-lg flex flex-col items-center justify-center space-y-4"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <motion.div
                                className="absolute inset-0 bg-brand-sienna/30 rounded-full"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                            />
                            {/* Make MicIcon larger for the overlay */}
                            <div className="transform scale-150">
                                <MicIcon isListening={true} />
                            </div>
                        </div>
                        <p className="text-brand-charcoal font-semibold text-lg absolute bottom-[-30px]">
                            Listening...
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default WakeWordOverlay;
