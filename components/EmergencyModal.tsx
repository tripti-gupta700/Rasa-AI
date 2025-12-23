import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmergencyPayload } from '../types';

interface EmergencyModalProps {
    payload: EmergencyPayload | null;
    onClose: () => void;
}

const EmergencyModal: React.FC<EmergencyModalProps> = ({ payload, onClose }) => {
    return (
        <AnimatePresence>
            {payload && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="bg-cream w-full max-w-md rounded-2xl shadow-2xl border-4 border-red-500 text-center p-8 relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-600 rounded-full p-3 border-4 border-cream">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold text-red-800 mt-6">{payload.title}</h2>
                        <p className="mt-2 text-brand-charcoal">{payload.message}</p>
                        
                        <div className="flex flex-col gap-3 mt-6">
                            {payload.actions.map((action, index) => (
                                <a 
                                    key={index} 
                                    href={action.url}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block w-full text-center bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors text-lg"
                                >
                                    {action.text}
                                </a>
                            ))}
                        </div>

                        <button
                            onClick={onClose}
                            className="mt-6 text-sm text-gray-500 hover:underline"
                        >
                            Dismiss and return to chat
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EmergencyModal;
