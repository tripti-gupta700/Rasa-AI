import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CameraIcon, MicIcon, SpeakerIcon } from '../components/icons';
import { analyzeSymptomImage } from '../services/aiBackend';
import { renderMarkdown } from '../utils/helpers';
import { useSpeechRecognition, isSpeechRecognitionSupported } from '../hooks/useSpeechRecognition';

// A unique, static ID for the analysis text block for TTS control
const VISION_PAGE_ANALYSIS_ID = -1;
const LANG_TOKEN_REGEX = /\[LANG:([\w-]+)\]/;

interface VisionPageProps {
    lang: string;
    onSpeak: (text: string, lang: string, messageId: number) => void;
    onCancelSpeak: () => void;
    speakingMessageId: number | null;
}

const VisionPage: React.FC<VisionPageProps> = ({ lang, onSpeak, onCancelSpeak, speakingMessageId }) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<{ text: string; lang: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { isListening, toggleListening } = useSpeechRecognition(
        (transcript) => setPrompt(transcript),
        lang
    );

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                setError('Please select an image smaller than 4MB.');
                return;
            }
            setError(null);
            setAnalysisResult(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalysis = async () => {
        if (!imagePreview) {
            setError('Please upload an image first.');
            return;
        }
        
        setIsLoading(true);
        setAnalysisResult(null);
        setError(null);

        const base64Image = imagePreview.split(',')[1];
        const mimeType = imagePreview.match(/data:(.*);base64,/)?.[1] || 'image/jpeg';

        try {
            const rawResult = await analyzeSymptomImage(base64Image, mimeType, prompt, lang);
            
            const langMatch = rawResult.match(LANG_TOKEN_REGEX);
            const detectedLang = langMatch ? langMatch[1] : lang;
            const text = rawResult.replace(LANG_TOKEN_REGEX, '').trimStart();

            setAnalysisResult({ text, lang: detectedLang });

            // Automatically speak the result
            onSpeak(text, detectedLang, VISION_PAGE_ANALYSIS_ID);

        } catch (err) {
            console.error(err);
            setError('Failed to analyze the image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const triggerFileSelect = () => fileInputRef.current?.click();
    
    const handleSpeak = () => {
        if (!analysisResult) return;
        
        const isCurrentlySpeaking = speakingMessageId === VISION_PAGE_ANALYSIS_ID;

        if (isCurrentlySpeaking) {
            onCancelSpeak();
        } else {
            onSpeak(analysisResult.text, analysisResult.lang, VISION_PAGE_ANALYSIS_ID);
        }
    };

    const isSpeakingThis = speakingMessageId === VISION_PAGE_ANALYSIS_ID;

    return (
        <div className="h-full bg-cream p-4 sm:p-6 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto text-center"
            >
                <div className="flex items-center justify-center text-brand-brown mb-2">
                    <CameraIcon />
                    <h2 className="text-3xl font-bold ml-2">Symptom Vision</h2>
                </div>
                <p className="text-brand-charcoal/80 mb-6">
                    Upload a photo and describe your symptom for a preliminary Ayurvedic analysis.
                </p>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                <div
                    onClick={!imagePreview ? triggerFileSelect : undefined}
                    className={`w-full border-2 border-dashed border-brand-sienna/50 rounded-2xl p-6 text-center text-brand-sienna ${!imagePreview ? 'cursor-pointer hover:bg-brand-sienna/10' : ''} transition-colors`}
                >
                    {imagePreview ? (
                        <div className="flex flex-col items-center">
                            <img src={imagePreview} alt="Symptom preview" className="max-h-48 w-auto rounded-lg shadow-lg" />
                            <button
                                onClick={triggerFileSelect}
                                className="mt-4 px-4 py-2 bg-brand-yellow rounded-full text-brand-brown font-semibold hover:bg-opacity-80 text-sm"
                            >
                                Change Photo
                            </button>
                        </div>
                    ) : (
                        <div className="py-8">
                            <CameraIcon />
                            <span className="mt-2 block font-semibold">Tap to Upload Photo</span>
                        </div>
                    )}
                </div>

                {error && <p className="text-red-500 mt-4">{error}</p>}
                
                {imagePreview && (
                     <div className="mt-4 text-left">
                        <label htmlFor="symptom-prompt" className="text-sm font-bold text-brand-charcoal block mb-1">
                            Describe the symptom (optional)
                        </label>
                        <div className="flex items-end space-x-2 bg-brand-beige rounded-xl p-2 shadow-inner">
                            <textarea
                                id="symptom-prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., 'What kind of rash is this?'"
                                className="flex-grow py-2 px-3 bg-transparent focus:outline-none resize-none text-brand-brown placeholder-brand-charcoal/50 max-h-24 overflow-y-auto"
                                rows={1}
                                disabled={isLoading}
                            />
                            {isSpeechRecognitionSupported && (
                                <button
                                    onClick={toggleListening}
                                    disabled={isLoading}
                                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-brand-yellow disabled:opacity-50 transition-transform hover:scale-105"
                                    aria-label={isListening ? 'Stop listening' : 'Describe symptom with voice'}
                                >
                                    <MicIcon isListening={isListening} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleAnalysis}
                            disabled={isLoading || !imagePreview}
                            className="mt-4 w-full py-3 px-4 bg-brand-sienna text-white font-semibold rounded-md hover:bg-opacity-90 disabled:bg-gray-400"
                        >
                            {isLoading ? 'Analyzing...' : 'Analyze Symptom'}
                        </button>
                    </div>
                )}

                <AnimatePresence>
                {(isLoading || analysisResult) && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 text-left bg-brand-beige p-6 rounded-2xl min-h-[10rem]"
                    >
                         <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-lg text-brand-charcoal">AI Analysis</h3>
                            {analysisResult && (
                                <button onClick={handleSpeak} className="p-1 rounded-full hover:bg-black/10 transition-colors" aria-label="Read analysis aloud">
                                    <SpeakerIcon className={isSpeakingThis ? 'animate-pulse text-brand-sienna' : ''} />
                               </button>
                            )}
                        </div>
                        {isLoading ? (
                             <div className="flex justify-center items-center h-24">
                                <div className="w-3 h-3 bg-brand-sienna rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="w-3 h-3 bg-brand-sienna rounded-full animate-pulse [animation-delay:-0.15s] mx-2"></div>
                                <div className="w-3 h-3 bg-brand-sienna rounded-full animate-pulse"></div>
                            </div>
                        ) : (
                            analysisResult && <div className="text-brand-charcoal leading-relaxed space-y-4" dangerouslySetInnerHTML={renderMarkdown(analysisResult.text)} />
                        )}
                    </motion.div>
                )}
                </AnimatePresence>

            </motion.div>
        </div>
    );
};

export default VisionPage;