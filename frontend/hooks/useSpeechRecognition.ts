import { useState, useRef, useCallback } from 'react';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
export const isSpeechRecognitionSupported = !!SpeechRecognition;

export const useSpeechRecognition = (
    onResult: (transcript: string) => void,
    lang: string
) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const toggleListening = useCallback(() => {
        if (!isSpeechRecognitionSupported) {
            alert("Your browser doesn't support speech recognition.");
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }
        
        const recognition = new SpeechRecognition();
        
        // Map regional languages to a supported parent for Speech Recognition API
        const langFallbacks: Record<string, string> = {
            'gmj-in': 'hi-IN',
            'kfy-in': 'hi-IN',
        };
        recognition.lang = langFallbacks[lang.toLowerCase()] || lang;

        recognition.interimResults = false;
        recognition.continuous = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => onResult(event.results[0][0].transcript);
        recognition.onerror = (event: any) => console.error('Speech recognition error:', event.error);
        recognition.onend = () => setIsListening(false);
        
        recognition.start();
        recognitionRef.current = recognition;
    }, [isListening, lang, onResult]);

    return { isListening, toggleListening };
};