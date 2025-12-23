import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '../types';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';

interface ChatWindowProps {
    messages: Message[];
    isLoading: boolean;
    lang: string;
    onSpeak: (text: string, lang: string, messageId: number) => void;
    onCancelSpeak: () => void;
    speakingMessageId: number | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, lang, onSpeak, onCancelSpeak, speakingMessageId }) => {
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div className="flex-grow p-4 space-y-4">
             <AnimatePresence>
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <MessageBubble 
                            message={msg} 
                            lang={lang}
                            onSpeak={onSpeak}
                            onCancelSpeak={onCancelSpeak}
                            speakingMessageId={speakingMessageId}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
            {isLoading && <LoadingIndicator />}
            <div ref={chatEndRef} />
        </div>
    );
};

export default ChatWindow;