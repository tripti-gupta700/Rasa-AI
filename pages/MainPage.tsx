import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Transition } from 'framer-motion';
import { User, DailyTipData, EmergencyPayload, View } from '../types';
import { LANGUAGES, DAILY_TIP_KEY, SEASONAL_WISDOM_KEY } from '../constants';
import { generateDailyTip, generateSeasonalWisdom } from '../services/gemini';
import { clearChatHistory } from '../services/mockApi';
import { getCurrentSeason } from '../utils/helpers';
import { useWakeWord } from '../hooks/useWakeWord';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

import Header from '../components/Header';
import BottomBar from '../components/BottomBar';
import WakeWordOverlay from '../components/WakeWordOverlay';
import EmergencyModal from '../components/EmergencyModal';
import ChatPage from './ChatPage';
import DailyTipPage from './DailyTipPage';
import WisdomPage from './WisdomPage';
import ConsultPage from './ConsultPage';
import SettingsPage from './SettingsPage';
import VisionPage from './VisionPage';

interface MainPageProps {
    user: User;
    onLogout: () => void;
    onSwitchToConsultant: () => void;
}

const pageVariants = {
    initial: { opacity: 0, y: 10 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -10 },
};

const pageTransition: Transition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
};

const MainPage: React.FC<MainPageProps> = ({ user, onLogout, onSwitchToConsultant }) => {
    const [activeView, setActiveView] = useState<View>('chat');
    const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>(LANGUAGES[0].code);
    const [selectedLanguageName, setSelectedLanguageName] = useState<string>(LANGUAGES[0].name);
    const [dailyTip, setDailyTip] = useState<DailyTipData | null>(null);
    const [seasonalWisdom, setSeasonalWisdom] = useState<string | null>(null);
    const [currentSeason, setCurrentSeason] = useState('');
    const [newChatTrigger, setNewChatTrigger] = useState(0);
    const [emergencyPayload, setEmergencyPayload] = useState<EmergencyPayload | null>(null);
    
    // Centralized Speech Synthesis
    const [speakingMessageId, setSpeakingMessageId] = useState<number | null>(null);
    const { speak, cancel } = useSpeechSynthesis();

    const handleSpeak = useCallback((text: string, lang: string, messageId: number) => {
        // The `speak` function in the synthesis hook is designed to handle cancellations
        // automatically. We just need to manage the UI state here.
        setSpeakingMessageId(messageId);
        speak(text, lang, () => setSpeakingMessageId(null)); // onEnd callback resets the ID
    }, [speak]);

    const handleCancelSpeak = useCallback(() => {
        cancel();
        setSpeakingMessageId(null);
    }, [cancel]);

    // Wake Word
    const [voiceCommand, setVoiceCommand] = useState<{ command: string; id: number } | null>(null);

    const handleVoiceCommand = useCallback((command: string) => {
        setVoiceCommand({ command, id: Date.now() });
        setActiveView('chat');
    }, []);
    
    const { wakeWordState } = useWakeWord(handleVoiceCommand, selectedLanguageCode);

    const handleVoiceCommandProcessed = useCallback(() => {
        setVoiceCommand(null);
    }, []);

    useEffect(() => {
        setCurrentSeason(getCurrentSeason());
    }, []);

    const handleLanguageChange = useCallback(async (newLangCode: string, newLangName: string) => {
        setSelectedLanguageCode(newLangCode);
        setSelectedLanguageName(newLangName);
    }, []);
    
    const handleNewChat = useCallback(async () => {
        if (!user) return;
        handleCancelSpeak(); // Stop any speech on new chat
        await clearChatHistory(user.id);
        setActiveView('chat');
        setNewChatTrigger(prev => prev + 1); 
    }, [user, handleCancelSpeak]);

    const handleAiNavigation = useCallback((target: View | 'new_chat') => {
        if (target === 'new_chat') {
            handleNewChat();
        } else {
            setActiveView(target);
        }
    }, [handleNewChat]);


    // Effect for fetching daily tip with caching
    useEffect(() => {
        if (activeView === 'tip') {
            const getTip = async () => {
                const today = new Date().toDateString();
                const storedTipData = localStorage.getItem(DAILY_TIP_KEY);
                if (storedTipData) {
                    try {
                        const { date, lang, data } = JSON.parse(storedTipData);
                        if (date === today && lang === selectedLanguageCode) {
                            setDailyTip(data);
                            return;
                        }
                    } catch (e) {
                        localStorage.removeItem(DAILY_TIP_KEY);
                    }
                }

                setDailyTip(null); // Force loading
                const tipData = await generateDailyTip(selectedLanguageCode);
                setDailyTip(tipData);
                 if (tipData.tip) { // Only cache if tip is valid
                    localStorage.setItem(DAILY_TIP_KEY, JSON.stringify({
                        date: today,
                        lang: selectedLanguageCode,
                        data: tipData
                    }));
                }
            };
            getTip();
        }
    }, [activeView, selectedLanguageCode]);
    
    // Effect for fetching seasonal wisdom with caching
    useEffect(() => {
        if (activeView === 'wisdom' && currentSeason) {
            const getWisdom = async () => {
                const storedWisdomData = localStorage.getItem(SEASONAL_WISDOM_KEY);
                 if (storedWisdomData) {
                    try {
                        const { season, lang, data } = JSON.parse(storedWisdomData);
                        if (season === currentSeason && lang === selectedLanguageCode) {
                            setSeasonalWisdom(data);
                            return;
                        }
                    } catch (e) {
                         localStorage.removeItem(SEASONAL_WISDOM_KEY);
                    }
                }

                setSeasonalWisdom(null); // Force loading
                const newWisdom = await generateSeasonalWisdom(currentSeason, selectedLanguageCode);
                setSeasonalWisdom(newWisdom);
                localStorage.setItem(SEASONAL_WISDOM_KEY, JSON.stringify({
                    season: currentSeason,
                    lang: selectedLanguageCode,
                    data: newWisdom,
                }));
            };
            getWisdom();
        }
    }, [activeView, currentSeason, selectedLanguageCode]);


    const renderView = () => {
        switch (activeView) {
            case 'chat':
                return <ChatPage 
                           key={newChatTrigger}
                           user={user} 
                           selectedLanguage={selectedLanguageCode} 
                           onAiNavigate={handleAiNavigation}
                           voiceCommand={voiceCommand}
                           onVoiceCommandProcessed={handleVoiceCommandProcessed}
                           onEmergencyDetected={setEmergencyPayload}
                           onSpeak={handleSpeak}
                           onCancelSpeak={handleCancelSpeak}
                           speakingMessageId={speakingMessageId}
                       />;
            case 'tip':
                return <DailyTipPage tipData={dailyTip} />;
            case 'vision':
                return <VisionPage 
                            lang={selectedLanguageCode}
                            onSpeak={handleSpeak}
                            onCancelSpeak={handleCancelSpeak}
                            speakingMessageId={speakingMessageId}
                       />;
            case 'wisdom':
                return <WisdomPage wisdom={seasonalWisdom} season={currentSeason} />;
            case 'consult':
                return <ConsultPage />;
            case 'settings':
                return <SettingsPage user={user} onSwitchToConsultant={onSwitchToConsultant} />;
            default:
                return <div />;
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-cream text-brand-charcoal">
            <WakeWordOverlay state={wakeWordState} />
            <EmergencyModal payload={emergencyPayload} onClose={() => setEmergencyPayload(null)} />
            <Header
                selectedLanguageName={selectedLanguageName}
                onLanguageChange={handleLanguageChange}
                onNewChat={handleNewChat}
                onLogout={onLogout}
            />
            
            <main className="flex-grow overflow-y-auto pb-20">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={activeView}
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        className="h-full w-full"
                    >
                        {renderView()}
                    </motion.div>
                </AnimatePresence>
            </main>

            <BottomBar activeView={activeView} setActiveView={setActiveView} />
        </div>
    );
};

export default MainPage;