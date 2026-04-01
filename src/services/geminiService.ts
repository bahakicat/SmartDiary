import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, VocalMetrics, Emotion } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const analyzeEntry = async (
  text: string, 
  vocalMetrics?: VocalMetrics, 
  lang: string = 'en',
  persona: string = 'default'
): Promise<AnalysisResult> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("CRITICAL ERROR: GEMINI_API_KEY is missing or undefined in the environment.");
    throw new Error("API Key is missing. Please check environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const startTime = Date.now();
  const model = "gemini-3-flash-preview";
  
  const languageName = lang === 'ru' ? 'Russian' : lang === 'kk' ? 'Kazakh' : 'English';

  let prompt = `Analyze the emotional content of the following journal entry and provide personalized psychological advice.
    Adopt a ${persona} persona for the advice.
    
    User Entry: "${text}"`;

  if (vocalMetrics) {
    prompt += `
    
    Voice Data (Non-verbal cues):
    - Pitch: ${vocalMetrics.pitch.toFixed(0)} Hz
    - Volume: ${vocalMetrics.volume.toFixed(1)} dB
    - Tempo: ${vocalMetrics.tempo.toFixed(0)} WPM
    - Stability: ${vocalMetrics.stability.toFixed(2)}`;
  }

  prompt += `
    
    Required Output Format (JSON):
    1. primary_emotion: Dominant emotion (happy, sad, angry, anxious, neutral, excited, calm, frustrated).
    2. confidence: Float (0-1).
    3. emotion_scores: Normalized scores for all 8 emotions.
    4. sentiment: 'positive', 'negative', or 'neutral'.
    5. keywords: 3-5 emotional keywords.
    6. context_tags: 1-3 tags (Work, Health, Relationships, etc.) in ${languageName}.
    7. advice: Empathetic, actionable advice in ${languageName}. Keep it supportive and constructive.
    8. intensity: Float (0-1) representing the emotional intensity.`;

  try {
    console.log("Sending request to Gemini API...");
    const responsePromise = ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primary_emotion: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            emotion_scores: {
              type: Type.OBJECT,
              properties: {
                happy: { type: Type.NUMBER },
                sad: { type: Type.NUMBER },
                angry: { type: Type.NUMBER },
                anxious: { type: Type.NUMBER },
                neutral: { type: Type.NUMBER },
                excited: { type: Type.NUMBER },
                calm: { type: Type.NUMBER },
                frustrated: { type: Type.NUMBER },
              },
              required: ["happy", "sad", "angry", "anxious", "neutral", "excited", "calm", "frustrated"]
            },
            sentiment: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            context_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            advice: { type: Type.STRING },
            intensity: { type: Type.NUMBER }
          },
          required: ["primary_emotion", "confidence", "emotion_scores", "sentiment", "keywords", "context_tags", "advice", "intensity"]
        }
      }
    });

    // Add a 30-second timeout to prevent infinite loading
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Request timed out after 30 seconds.")), 30000)
    );

    const response = await Promise.race([responsePromise, timeoutPromise]);
    console.log("Received response from Gemini API successfully.");

    let responseText = response.text || "{}";
    // Strip markdown code blocks if present
    if (responseText.startsWith("```json")) {
      responseText = responseText.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    const result = JSON.parse(responseText);
    const duration = Date.now() - startTime;

    return {
      id: crypto.randomUUID(),
      text: text,
      created_at: new Date().toISOString(),
      is_favorite: false,
      tags: result.context_tags || [],
      color: '#6366f1', // Default, will be overridden by EMOTION_COLORS in UI
      vocal_metrics: vocalMetrics,
      ...result
    };
  } catch (error) {
    console.error("Gemini API Error details:", error);
    throw error;
  }
};
