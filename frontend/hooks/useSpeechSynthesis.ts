import { useState, useCallback, useEffect } from 'react';

// --- Voice Modulation Settings ---
interface VoiceModulation {
    rate: number;
    pitch: number;
}

// Define specific rate and pitch settings for different languages for more natural speech.
const languageModulations: Record<string, VoiceModulation> = {
    'en-US': { rate: 1, pitch: 1 },
    'hi-IN': { rate: 1.05, pitch: 1.05 },
    'gmj-IN': { rate: 1.0, pitch: 1.08 }, // Garhwali (uses Hindi voice with different modulation)
    'kfy-IN': { rate: 1.02, pitch: 1.06 }, // Kumaoni (uses Hindi voice with different modulation)
    'bn-IN': { rate: 0.95, pitch: 1.1 },
    'ta-IN': { rate: 1.1, pitch: 1 },
    'te-IN': { rate: 1.0, pitch: 1.05 },
    'gu-IN': { rate: 1.0, pitch: 1.02 },
    'kn-IN': { rate: 1.1, pitch: 1.0 },
    'ml-IN': { rate: 0.98, pitch: 1.05 },
    'mr-IN': { rate: 1.0, pitch: 1 },
};

const DEFAULT_MODULATION: VoiceModulation = { rate: 1, pitch: 1 };


// Helper to find the best matching voice available in the browser
const findBestVoice = (lang: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    if (!lang || voices.length === 0) return null;
    
    const targetLang = lang.replace('_', '-').toLowerCase();
    
    // Map regional languages to a supported TTS parent language for voice searching
    const langFallbacks: Record<string, string> = {
        'gmj-in': 'hi-IN',
        'kfy-in': 'hi-IN',
    };
    const fallbackLang = langFallbacks[targetLang];
    const targetBaseLang = targetLang.split('-')[0];

    // Prioritize voices based on quality of match
    const voiceScores: { voice: SpeechSynthesisVoice; score: number }[] = voices.map(voice => {
        const voiceLang = voice.lang.replace('_', '-').toLowerCase();
        let score = 0;
        
        // 1. Exact match for original lang (e.g., if a 'gmj-IN' voice ever exists) - Highest score
        if (voiceLang === targetLang) {
            score = 5;
        } 
        // 2. Exact match for the fallback language (e.g., 'hi-IN')
        else if (fallbackLang && voiceLang === fallbackLang) {
            score = 4;
        }
        // 3. Base language match for original lang (e.g., 'gmj' vs 'gmj-IN')
        else if (voiceLang.startsWith(targetBaseLang)) {
            score = 3;
        }
        // 4. Base language match for fallback lang (e.g., 'hi' vs 'hi-IN')
        else if (fallbackLang && voiceLang.startsWith(fallbackLang.split('-')[0])) {
            score = 2;
        }
        
        // Boost score if it's the default voice for that language
        if (score > 0 && voice.default) {
            score++;
        }
        
        return { voice, score };
    });
    
    const bestMatch = voiceScores.filter(v => v.score > 0).sort((a, b) => b.score - a.score)[0];

    return bestMatch ? bestMatch.voice : null;
};


export const useSpeechSynthesis = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    const populateVoices = useCallback(() => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
            setVoices(availableVoices);
        }
    }, []);

    // Effect to populate and update voices when they change.
    useEffect(() => {
        // Some browsers load voices asynchronously. This handles it.
        populateVoices();
        window.speechSynthesis.addEventListener('voiceschanged', populateVoices);
        
        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', populateVoices);
            // Cleanup: cancel speech on unmount
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, [populateVoices]);

    const speak = useCallback((text: string, lang: string, onEnd?: () => void) => {
        if (!('speechSynthesis' in window) || !text) {
             if (onEnd) onEnd();
            return;
        }

        // Always cancel any currently speaking utterance before starting a new one.
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;

        // Apply language-specific voice modulation
        const modulation = languageModulations[lang] || DEFAULT_MODULATION;
        utterance.rate = modulation.rate;
        utterance.pitch = modulation.pitch;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            if(onEnd) onEnd();
        };
        utterance.onerror = (event) => {
            // "canceled" and "interrupted" are expected when we manually stop speech to start another.
            // We don't need to log these as errors.
            if (event.error !== 'canceled' && event.error !== 'interrupted') {
                console.error('Speech synthesis error:', event.error);
            }
            setIsSpeaking(false);
            if(onEnd) onEnd();
        };
        
        const bestVoice = findBestVoice(lang, voices);
        if (bestVoice) {
            utterance.voice = bestVoice;
        } else {
             // We still try to speak. The browser might handle the `lang` property on its own
             // even if no specific voice is found. This is better than failing silently.
            console.warn(`No specific voice for language '${lang}' found. The browser will use its default. Ensure OS language packs are installed.`);
        }

        window.speechSynthesis.speak(utterance);
    }, [voices]); // Depend on voices state, so the function is updated when voices are loaded

    const cancel = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, []);

    return { speak, cancel, isSpeaking };
};