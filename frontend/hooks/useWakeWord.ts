import { useState, useEffect, useRef, useCallback } from 'react';

const WAKE_PHRASES = ["ok rasa", "okay rasa"];
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

export type WakeWordState = 'IDLE' | 'AWAKE' | 'LISTENING';

// Helper to map custom language codes to supported browser API codes
const mapLangForApi = (langCode: string) => {
    const langFallbacks: Record<string, string> = {
        'gmj-in': 'hi-IN',
        'kfy-in': 'hi-IN',
    };
    return langFallbacks[langCode.toLowerCase()] || langCode;
};


export const useWakeWord = (
    onCommand: (command: string) => void,
    lang: string
) => {
    const [wakeWordState, setWakeWordState] = useState<WakeWordState>('IDLE');
    const recognitionRef = useRef<any>(null);
    const wakeWordListenerRef = useRef<any>(null);

    const stopRecognition = useCallback((recognizerRef: React.MutableRefObject<any>) => {
        if (recognizerRef.current) {
            recognizerRef.current.onend = null;
            recognizerRef.current.onerror = null;
            recognizerRef.current.onresult = null;
            recognizerRef.current.stop();
            recognizerRef.current = null;
        }
    }, []);

    const listenForCommand = useCallback(() => {
        if (!isSpeechRecognitionSupported) return;
        
        stopRecognition(wakeWordListenerRef);
        setWakeWordState('AWAKE');

        const commandRecognizer = new SpeechRecognition();
        commandRecognizer.lang = mapLangForApi(lang);
        commandRecognizer.continuous = false;
        commandRecognizer.interimResults = false;

        commandRecognizer.onstart = () => setWakeWordState('LISTENING');
        
        commandRecognizer.onresult = (event: any) => {
            const command = event.results[0][0].transcript.trim();
            if (command) {
                onCommand(command);
            }
        };

        const resetToIdle = () => {
            stopRecognition(recognitionRef);
            setWakeWordState('IDLE');
        };
        
        commandRecognizer.onend = resetToIdle;
        commandRecognizer.onerror = (event: any) => {
            if (event.error !== 'no-speech') {
                console.error('Command recognition error:', event.error);
            }
            resetToIdle();
        };

        commandRecognizer.start();
        recognitionRef.current = commandRecognizer;

    }, [lang, onCommand, stopRecognition, wakeWordListenerRef]);

    const listenForWakeWord = useCallback(() => {
        if (!isSpeechRecognitionSupported) return;
        
        stopRecognition(recognitionRef);

        const wakeWordRecognizer = new SpeechRecognition();
        wakeWordRecognizer.lang = mapLangForApi(lang);
        wakeWordRecognizer.continuous = true;
        wakeWordRecognizer.interimResults = true;

        wakeWordRecognizer.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result: any) => result.transcript)
                .join('')
                .toLowerCase();
            
            if (WAKE_PHRASES.some(phrase => transcript.includes(phrase))) {
                listenForCommand();
            }
        };

        wakeWordRecognizer.onend = () => {
            // Auto-restart if not intentionally stopped
            if (wakeWordListenerRef.current) {
                try {
                    wakeWordListenerRef.current.start();
                } catch(e) {
                    console.error("Could not restart wake word listener", e);
                }
            }
        };

        wakeWordRecognizer.onerror = (event: any) => {
             if (event.error === 'not-allowed') {
                console.error("Microphone permission was denied for wake word listener.");
                // Stop trying to prevent repeated permission prompts
                stopRecognition(wakeWordListenerRef);
             } else if (event.error !== 'no-speech') {
                console.error('Wake word listener error:', event.error);
             }
        };

        wakeWordRecognizer.start();
        wakeWordListenerRef.current = wakeWordRecognizer;

    }, [lang, listenForCommand, stopRecognition, recognitionRef]);
    
    useEffect(() => {
        if (wakeWordState === 'IDLE') {
            listenForWakeWord();
        }
        return () => {
            stopRecognition(recognitionRef);
            stopRecognition(wakeWordListenerRef);
        }
    }, [wakeWordState, listenForWakeWord, stopRecognition]);

    // Restart listener if language changes
    useEffect(() => {
        stopRecognition(recognitionRef);
        stopRecognition(wakeWordListenerRef);
        setWakeWordState('IDLE');
    }, [lang, stopRecognition]);

    return { wakeWordState };
};