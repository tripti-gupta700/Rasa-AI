import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MicIcon, SendIcon } from './icons';
import { isSpeechRecognitionSupported } from '../hooks/useSpeechRecognition';

interface ChatInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSend: () => void;
    onListen: () => void;
    isLoading: boolean;
    isListening: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, onListen, isLoading, isListening }) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading && value.trim()) onSend();
        }
    };
    
    // Auto-resizing textarea
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const hasText = value.trim().length > 0;

    return (
        <footer className="bg-cream p-3 border-t border-brand-beige">
            <div className="flex items-end space-x-3 bg-brand-beige rounded-3xl p-2 shadow-inner">
                <textarea
                    value={value}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    onInput={handleInput}
                    placeholder="Type a message"
                    className="flex-grow py-2 px-4 bg-transparent focus:outline-none resize-none text-brand-brown placeholder-brand-charcoal/50 max-h-28 overflow-y-auto"
                    rows={1}
                    disabled={isLoading}
                />
                
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    <AnimatePresence mode="popLayout">
                        {hasText ? (
                            <motion.button
                                key="send"
                                onClick={onSend}
                                disabled={isLoading || !hasText}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-brand-sienna disabled:opacity-50 transition-transform hover:scale-105"
                                aria-label="Send message"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <SendIcon />
                            </motion.button>
                        ) : (
                            isSpeechRecognitionSupported && (
                                <motion.button
                                    key="mic"
                                    onClick={onListen}
                                    disabled={isLoading}
                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-brand-yellow disabled:opacity-50 transition-transform hover:scale-105"
                                    aria-label={isListening ? 'Stop listening' : 'Start listening'}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <MicIcon isListening={isListening} />
                                </motion.button>
                            )
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </footer>
    );
};

export default ChatInput;
