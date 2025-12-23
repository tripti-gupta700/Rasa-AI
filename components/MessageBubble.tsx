import React from 'react';
import { Message } from '../types';
import { renderMarkdown } from '../utils/helpers';
import { WandIcon, SpeakerIcon, VerifiedIcon } from './icons';
import RecipeAccordion from './RecipeAccordion';

interface MessageBubbleProps {
    message: Message;
    lang: string; // Global language as a fallback
    onSpeak: (text: string, lang: string, messageId: number) => void;
    onCancelSpeak: () => void;
    speakingMessageId: number | null;
}

const EmergencyMessage: React.FC<{ payload: NonNullable<Message['emergencyPayload']> }> = ({ payload }) => (
    <div className="border-2 border-red-500 bg-red-50 rounded-lg p-4">
        <h3 className="text-lg font-bold text-red-800">{payload.title}</h3>
        <p className="text-red-700 my-2">{payload.message}</p>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
            {payload.actions.map((action, index) => (
                <a 
                    key={index} 
                    href={action.url}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 text-center bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                >
                    {action.text}
                </a>
            ))}
        </div>
    </div>
);


const MessageBubble: React.FC<MessageBubbleProps> = ({ message, lang, onSpeak, onCancelSpeak, speakingMessageId }) => {
    const isUser = message.sender === 'user';
    const isSpeaking = speakingMessageId === message.id;

    const bubbleClasses = isUser
        ? 'bg-brand-yellow self-end'
        : 'bg-brand-beige self-start';
        
    const handleSpeak = () => {
        if (isSpeaking) {
            onCancelSpeak();
        } else if (message.text) {
            // Prioritize the detected language of the message, fallback to global language
            const langToSpeak = message.lang || lang;
            onSpeak(message.text, langToSpeak, message.id);
        }
    };
    
    return (
        <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl rounded-2xl p-4 shadow-sm text-brand-brown ${bubbleClasses} w-full`}>
                 {!isUser && (
                     <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <WandIcon />
                            <span className="ml-2 font-bold text-sm">Rasa AI</span>
                        </div>
                        {message.text && (
                           <button onClick={handleSpeak} className="p-1 rounded-full hover:bg-black/10 transition-colors" aria-label="Read message aloud">
                               <SpeakerIcon className={isSpeaking ? 'animate-pulse text-brand-sienna' : ''} />
                           </button>
                        )}
                     </div>
                 )}
                {message.emergencyPayload ? (
                    <EmergencyMessage payload={message.emergencyPayload} />
                ) : (
                    <>
                        {message.text && <div dangerouslySetInnerHTML={renderMarkdown(message.text)} />}
                        {message.recipes && <RecipeAccordion recipes={message.recipes} />}
                    </>
                )}
                 {!isUser && !message.emergencyPayload && (
                    <div className="mt-2 text-right">
                        <div className="inline-flex items-center text-xs text-green-700 font-semibold bg-green-100 px-2 py-1 rounded-full">
                            <VerifiedIcon />
                            <span className="ml-1">Verified by AYUSH guidelines</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;