import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { User, DailyTipData, EmergencyPayload, View } from '../types';
import { LANGUAGES } from '../constants';

import { generateDailyTip, generateSeasonalWisdom } from '../services/aiBackend';
import { clearChatHistory } from '../services/aiBackend';

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

const MainPage: React.FC<{
    user: User;
    onLogout: () => void;
    onSwitchToConsultant: () => void;
}> = ({ user, onLogout, onSwitchToConsultant }) => {

    const [view, setView] = useState<View>('chat');
    const [lang, setLang] = useState(LANGUAGES[0]);

    const [dailyTip, setDailyTip] = useState<DailyTipData | null>(null);
    const [wisdom, setWisdom] = useState<string | null>(null);
    const [season, setSeason] = useState('');

    const [emergency, setEmergency] = useState<EmergencyPayload | null>(null);

    /* ---------- VOICE COMMAND STATE ---------- */
    const [voiceCommand, setVoiceCommand] = useState<{
        command: string;
        id: number;
    } | null>(null);

    /* ---------- SPEECH SYNTHESIS ---------- */
    const { speak, cancel } = useSpeechSynthesis();
    const [speakingId, setSpeakingId] = useState<number | null>(null);

    const handleSpeak = (text: string, language: string, id: number) => {
        setSpeakingId(id);
        speak(text, language, () => setSpeakingId(null));
    };

    /* ---------- WAKE WORD ---------- */
    const handleVoiceCommand = useCallback((command: string) => {
        setVoiceCommand({ command, id: Date.now() });
        setView('chat');
    }, []);

    const { wakeWordState } = useWakeWord(handleVoiceCommand, lang.code);

    /* ---------- CHAT ---------- */
    const handleNewChat = async () => {
        cancel();
        await clearChatHistory(user.id);
        setView('chat');
    };

    /* ---------- SEASON ---------- */
    useEffect(() => {
        setSeason(getCurrentSeason());
    }, []);

    /* ---------- DAILY TIP / WISDOM ---------- */
    useEffect(() => {
        if (view === 'tip') {
            generateDailyTip(lang.code).then(setDailyTip);
        }

        if (view === 'wisdom') {
            generateSeasonalWisdom(season, lang.code).then(setWisdom);
        }
    }, [view, lang.code, season]);

    return (
        <div className="h-screen flex flex-col">

            <WakeWordOverlay state={wakeWordState} />
            <EmergencyModal payload={emergency} onClose={() => setEmergency(null)} />

            <Header
                selectedLanguageName={lang.name}
                onLanguageChange={(code, name) =>
                    setLang({ code, name, localName: name })
                }
                onNewChat={handleNewChat}
                onLogout={onLogout}
            />

            <main className="flex-grow overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >

                        {view === 'chat' && (
                            <ChatPage
                                user={user}
                                selectedLanguage={lang.code}
                                voiceCommand={voiceCommand}
                                onVoiceCommandProcessed={() => setVoiceCommand(null)}
                                onAiNavigate={(target) => {
                                    if (target === 'new_chat') handleNewChat();
                                    else setView(target);
                                }}
                                onEmergencyDetected={setEmergency}
                                onSpeak={handleSpeak}
                                onCancelSpeak={cancel}
                                speakingMessageId={speakingId}
                            />
                        )}

                        {view === 'tip' && (
                            <DailyTipPage tipData={dailyTip} />
                        )}

                        {view === 'wisdom' && (
                            <WisdomPage wisdom={wisdom} season={season} />
                        )}

                        {view === 'vision' && (
                            <VisionPage
                                lang={lang.code}
                                onSpeak={handleSpeak}
                                onCancelSpeak={cancel}
                                speakingMessageId={speakingId}
                            />
                        )}

                        {view === 'consult' && <ConsultPage />}

                        {view === 'settings' && (
                            <SettingsPage
                                user={user}
                                onSwitchToConsultant={onSwitchToConsultant}
                            />
                        )}

                    </motion.div>
                </AnimatePresence>
            </main>

            <BottomBar activeView={view} setActiveView={setView} />
        </div>
    );
};

export default MainPage;
