import { GoogleGenAI, Type } from '@google/genai';
import { SYSTEM_PROMPT, LANGUAGES } from '../constants';
import { User, Recipe, DailyTipData } from '../types';

// Access the API key. In Vite, defined via define in vite.config.ts.
const API_KEY = process.env.API_KEY;

// Debug log to help user verify key loading
console.log("Gemini Service Initialized. API Key configured:", !!API_KEY);

// Helper to get AI instance safely
const getAiClient = () => {
    if (!API_KEY) {
        console.error("API_KEY is missing. Please check your .env file in the root directory.");
        return new GoogleGenAI({ apiKey: 'MISSING_KEY' }); 
    }
    return new GoogleGenAI({ apiKey: API_KEY });
};

const ai = getAiClient();

const buildContextPrompt = (user: User) => {
    let context = '';
    if (user.role === 'user' && user.profile) {
        context += 'USER HEALTH CONTEXT: ';
        if (user.profile.age) context += `Age: ${user.profile.age}. `;
        if (user.profile.medicalHistory) context += `Medical History: ${user.profile.medicalHistory}. `;
        if (user.profile.foodAllergies) context += `Food Allergies: ${user.profile.foodAllergies}. `;
        context += 'Please tailor your advice to this context. ';
    }
    return context;
};

export const generateAiStream = async (prompt: string, user: User, streamUpdateCallback: (chunk: string) => void) => {
    if (!API_KEY) {
        streamUpdateCallback("⚠️ Error: API Key is missing. Please create a `.env` file in the project root with `API_KEY=your_key` and restart the server.");
        return;
    }

    const context = buildContextPrompt(user);
    const fullPrompt = `${context}User query: ${prompt}`;
    
    try {
        const response = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: { 
                systemInstruction: SYSTEM_PROMPT,
                thinkingConfig: { thinkingBudget: 0 } 
            }
        });

        for await (const chunk of response) {
            streamUpdateCallback(chunk.text);
        }
    } catch (error) {
        console.error("Error generating AI stream:", error);
        streamUpdateCallback("I apologize, but I encountered an error connecting to the AI service. Please check your internet connection and API Key.");
    }
};

export const analyzeSymptomImage = async (base64Image: string, mimeType: string, promptText: string, langCode: string): Promise<string> => {
    if (!API_KEY) return "API Key missing. Please configure your .env file.";

    const langName = LANGUAGES.find(l => l.code === langCode)?.name || 'English';
    const textPart = {
      text: `Language for response: ${langName}. User query about the image: "${promptText || 'Please analyze this image.'}". Analyze this image of a health symptom from an Ayurvedic perspective. What might it be? Suggest gentle, safe, preliminary remedies. IMPORTANT: Your response MUST begin with a language identifier token (e.g., [LANG:en-US]). Then start your response with a clear, bold disclaimer that you are an AI and cannot provide a medical diagnosis, and the user must see a doctor. Then provide your analysis.`
    };
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, imagePart] },
            config: {
                systemInstruction: SYSTEM_PROMPT,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing symptom image:", error);
        return `[LANG:${langCode}] Sorry, I was unable to analyze the image. Please try again.`;
    }
};


const generateIngredientImages = async (ingredients: string[]): Promise<{ingredient: string, base64: string}[]> => {
    if (!API_KEY) return [];
    if (!ingredients || ingredients.length === 0) return [];
    
    // Limit to max 2 images to manage load times and API calls
    const ingredientsToProcess = ingredients.slice(0, 2);

    try {
        const imagePromises = ingredientsToProcess.map(async (ingredient) => {
            const prompt = `A clear, studio photograph of ${ingredient.split(',')[0]} on a clean, white background. Focus on the single ingredient.`;
            const imageResponse = await ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: prompt,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
            });
            const base64Image = imageResponse.generatedImages[0].image.imageBytes;
            return { ingredient, base64: base64Image };
        });

        return await Promise.all(imagePromises);

    } catch (error) {
        console.error("Error generating ingredient images:", error);
        return []; // Return empty array on failure
    }
};

export const generateDailyTip = async (langCode: string): Promise<DailyTipData> => {
    if (!API_KEY) return { tip: "Please configure your API Key in .env file.", images: [] };

    const langName = LANGUAGES.find(l => l.code === langCode)?.name || 'English';
    const prompt = `Language: ${langName}. User query: Generate one unique, insightful, and concise Ayurvedic health tip for today. Identify up to two key ingredients mentioned in the tip.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_PROMPT,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tip: { type: Type.STRING },
                        ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['tip', 'ingredients'],
                },
                thinkingConfig: { thinkingBudget: 0 },
            },
        });
        const data = JSON.parse(response.text);
        const images = await generateIngredientImages(data.ingredients);
        
        return { tip: data.tip, images };

    } catch (error) {
        console.error("Failed to generate daily tip:", error);
        return { tip: "Remember to drink warm water throughout the day to aid digestion.", images: [] };
    }
};

export const generateSeasonalWisdom = async (season: string, langCode: string) => {
    if (!API_KEY) return "Please configure your API Key in .env file.";

    const langName = LANGUAGES.find(l => l.code === langCode)?.name || 'English';
    const prompt = `Language: ${langName}. User query: Provide a detailed guide on Ayurvedic seasonal remedies (Ritucharya) for the ${season} season. Include advice on diet, lifestyle, and common herbs. Format the response with clear headings and bullet points.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { 
                systemInstruction: SYSTEM_PROMPT,
                thinkingConfig: { thinkingBudget: 0 } 
            }
        });
        return response.text;
    } catch (error) {
        console.error(`Failed to generate wisdom for ${season}:`, error);
        return `Embrace the rhythm of ${season}. More wisdom is coming soon.`;
    }
};

export const translateText = async (text: string, targetLangCode: string) => {
    if (!API_KEY || !text) return text;
    const langName = LANGUAGES.find(l => l.code === targetLangCode)?.name || 'English';
    const prompt = `Language: ${langName}. User query: Translate the following text to ${langName}: "${text}"`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text;
    } catch (error) {
        console.error("Translation failed:", error);
        return text; // return original text on failure
    }
};