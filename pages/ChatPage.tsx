import React, { useState, useEffect, useCallback } from 'react';
import { Message, User, Recipe, EmergencyPayload } from '../types';
import { generateAiStream, translateText } from '../services/gemini';
import { getChatHistory, saveMessage, saveCompleteAIMessage, saveRecipeMessage } from '../services/mockApi';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { WELCOME_MESSAGE } from '../constants';
import { View } from '../types';

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
    const [welcomeText, setWelcomeText] = useState("Loading welcome message...");

    useEffect(() => {
        translateText(WELCOME_MESSAGE, selectedLanguage).then(setWelcomeText);
    }, [selectedLanguage]);
    
    const { isListening, toggleListening } = useSpeechRecognition(
        (transcript) => setInputMessage(transcript),
        selectedLanguage
    );
    
     useEffect(() => {
        const initChat = async () => {
             const history = await getChatHistory(user.id);
             if (history.length > 0) {
                 setMessages(history);
             }
        }
        initChat();
    }, [user.id]);
    
    const handleSendMessage = useCallback(async (messageToSend?: string) => {
        const currentMessageText = (messageToSend || inputMessage).trim();
        if (!currentMessageText || !user) return;

        const newUserMessage: Message = { id: Date.now(), text: currentMessageText, sender: 'user' };
        setMessages(prev => [...prev, newUserMessage]);
        setInputMessage('');
        setIsLoading(true);
        await saveMessage(user.id, newUserMessage);

        const aiMessageId = Date.now() + 1;
        const aiPlaceholderMessage: Message = { id: aiMessageId, sender: 'ai', text: '' };
        setMessages(prev => [...prev, aiPlaceholderMessage]);

        let accumulatedResponse = '';
        let isFirstChunk = true;
        let detectedLang = selectedLanguage; // Default to selected language
        let commandProcessed = false;


        await generateAiStream(currentMessageText, user, (chunk) => {
            if (commandProcessed) return;

            accumulatedResponse += chunk;
            if (isFirstChunk) {
                isFirstChunk = false;
                // Check for JSON commands (Emergency or Navigation)
                try {
                    const cleanResponse = accumulatedResponse.trim().replace(/^```json/, '').replace(/```$/, '');
                    const parsed = JSON.parse(cleanResponse);
                    
                    if (parsed.type === 'EMERGENCY_ALERT') {
                        onEmergencyDetected(parsed);
                        setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, text: undefined, emergencyPayload: parsed } : m));
                        commandProcessed = true;
                        // In a real app save this emergency event.
                        return;
                    }
                    
                    if (parsed.navigationTarget && parsed.confirmationText) {
                        onAiNavigate(parsed.navigationTarget);
                        setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, text: parsed.confirmationText } : m));
                        accumulatedResponse = parsed.confirmationText;
                        commandProcessed = true;
                        // Stream will continue, but we'll just accumulate the confirmation text
                    }
                } catch (e) {
                    // Not a JSON command, proceed to check for language token
                }
            }
            
            if (!commandProcessed) {
                const langMatch = accumulatedResponse.match(LANG_TOKEN_REGEX);
                if (langMatch) {
                    detectedLang = langMatch[1];
                    const textChunk = accumulatedResponse.replace(LANG_TOKEN_REGEX, '').trimStart();
                    setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, text: textChunk, lang: detectedLang } : m));
                } else {
                     setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, text: accumulatedResponse, lang: detectedLang } : m));
                }
            } else {
                 // If a command was processed, just update with the confirmation text
                 setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, text: accumulatedResponse, lang: detectedLang } : m));
            }
        });
        
        setIsLoading(false);
        const finalText = accumulatedResponse.replace(LANG_TOKEN_REGEX, '').trimStart();

        // After stream is complete, process for recipes or speak
        if (commandProcessed) {
             await saveCompleteAIMessage(user.id, aiMessageId, finalText, detectedLang);
             if (finalText) onSpeak(finalText, detectedLang, aiMessageId);
             return;
        }

        if (RECIPE_KEYWORDS_REGEX.test(currentMessageText)) {
            try {
                const recipes: Recipe[] = JSON.parse(finalText);
                setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, recipes, text: undefined, lang: detectedLang } : m));
                await saveRecipeMessage(user.id, aiMessageId, recipes);
            } catch (error) {
                // Not a valid recipe JSON, treat as regular text
                await saveCompleteAIMessage(user.id, aiMessageId, finalText, detectedLang);
                if (finalText) onSpeak(finalText, detectedLang, aiMessageId);
            }
        } else {
             await saveCompleteAIMessage(user.id, aiMessageId, finalText, detectedLang);
             if (finalText) onSpeak(finalText, detectedLang, aiMessageId);
        }

    }, [inputMessage, selectedLanguage, user, onAiNavigate, onSpeak, onEmergencyDetected]);
    
     // Effect to handle incoming voice commands
    useEffect(() => {
        if (voiceCommand) {
            handleSendMessage(voiceCommand.command);
            onVoiceCommandProcessed();
        }
    }, [voiceCommand, handleSendMessage, onVoiceCommandProcessed]);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-grow overflow-y-auto">
                 {messages.length === 0 ? (
                    <WelcomePage onPromptClick={handleSendMessage} welcomeMessage={welcomeText} />
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
                onChange={(e) => setInputMessage(e.target.value)}
                onSend={() => handleSendMessage()}
                onListen={toggleListening}
                isLoading={isLoading}
                isListening={isListening}
            />
        </div>
    );
};

export default ChatPage;