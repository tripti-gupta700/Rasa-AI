import React, { useState, useEffect, useCallback } from 'react';
import { Message, User, Recipe, EmergencyPayload, View } from '../types';
import { generateAiStream, translateText, getChatHistory, saveMessage, saveCompleteAIMessage, saveRecipeMessage } from '../services/aiBackend';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { WELCOME_MESSAGE } from '../constants';

import ChatWindow from '../components/ChatWindow';
import WelcomePage from './WelcomePage';
import ChatInput from '../components/ChatInput';

interface ChatPageProps {
    user: User;
    selectedLanguage: string;
    onAiNavigate: (target: View | 'new_chat') => void;
    voiceCommand: { command: string; id: number } | null;
    onVoiceCommandProcessed: () => void;
    onEmergencyDetected: (payload: EmergencyPayload) => void;
    onSpeak: (text: string, lang: string, messageId: number) => void;
    onCancelSpeak: () => void;
    speakingMessageId: number | null;
}

const RECIPE_KEYWORDS_REGEX = /\brecipes?|\bmake\b|\bcook\b|\bprepare\b|\bingredients for\b/i;
const LANG_TOKEN_REGEX = /\[LANG:([\w-]+)\]/;

const ChatPage: React.FC<ChatPageProps> = ({
    user,
    selectedLanguage,
    onAiNavigate,
    voiceCommand,
    onVoiceCommandProcessed,
    onEmergencyDetected,
    onSpeak,
    onCancelSpeak,
    speakingMessageId
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [welcomeText, setWelcomeText] = useState('');

    useEffect(() => {
        if (selectedLanguage === 'hi' || selectedLanguage === 'en') {
            translateText(WELCOME_MESSAGE, selectedLanguage).then(setWelcomeText);
        }
    }, [selectedLanguage]);

    const { isListening, toggleListening } = useSpeechRecognition(
        (transcript) => setInputMessage(transcript),
        selectedLanguage
    );

    useEffect(() => {
        getChatHistory(user.id).then(setMessages);
    }, [user.id]);

    const handleSendMessage = useCallback(async (messageOverride?: string) => {
        const text = (messageOverride || inputMessage).trim();
        if (!text) return;

        const userMsg: Message = { id: Date.now(), text, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputMessage('');
        setIsLoading(true);
        await saveMessage(user.id, userMsg);

        const aiId = Date.now() + 1;
        setMessages(prev => [...prev, { id: aiId, sender: 'ai', text: '' }]);

        let buffer = '';
        let detectedLang = selectedLanguage;

        await generateAiStream(text, user, (chunk) => {
            buffer += tick(chunk);

            const langMatch = buffer.match(LANG_TOKEN_REGEX);
            if (langMatch) {
                detectedLang = langMatch[1];
                buffer = buffer.replace(LANG_TOKEN_REGEX, '');
            }

            setMessages(prev =>
                prev.map(m => m.id === aiId ? { ...m, text: buffer, lang: detectedLang } : m)
            );
        });

        setIsLoading(false);

        if (RECIPE_KEYWORDS_REGEX.test(text)) {
            try {
                const recipes: Recipe[] = JSON.parse(buffer);
                setMessages(prev =>
                    prev.map(m => m.id === aiId ? { ...m, recipes, text: undefined } : m)
                );
                await saveRecipeMessage(user.id, aiId, recipes);
                return;
            } catch {}
        }

        await saveCompleteAIMessage(user.id, aiId, buffer, detectedLang);
        onSpeak(buffer, detectedLang, aiId);
    }, [inputMessage, selectedLanguage, user]);

    useEffect(() => {
        if (voiceCommand) {
            handleSendMessage(voiceCommand.command);
            onVoiceCommandProcessed();
        }
    }, [voiceCommand]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto">
                {messages.length === 0 ? (
                    <WelcomePage welcomeMessage={welcomeText} onPromptClick={handleSendMessage} />
                ) : (
                    <ChatWindow
                        messages={messages}
                        isLoading={isLoading}
                        lang={selectedLanguage}
                        onSpeak={onSpeak}
                        onCancelSpeak={onCancelSpeak}
                        speakingMessageId={speakingMessageId}
                    />
                )}
            </div>

            <ChatInput
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onSend={() => handleSendMessage()}
                onListen={toggleListening}
                isListening={isListening}
                isLoading={isLoading}
            />
        </div>
    );
};

export default ChatPage;
function tick(chunk: string) {
    return chunk;
}

