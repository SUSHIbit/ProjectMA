import { OpenAI } from "openai";

// Configure OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Language code to full name mapping
const languageMap = {
  ms: "Malay",
  id: "Indonesian",
  zh: "Chinese (Mandarin)",
  hi: "Hindi",
  es: "Spanish",
  ar: "Arabic",
  fr: "French",
  de: "German",
  ja: "Japanese",
  ko: "Korean",
  en: "English",
};

/**
 * Translates text to the target language
 *
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<string>} - Translated text
 */
export async function translateText(text, targetLanguage) {
  try {
    if (!text) {
      throw new Error("No text provided for translation");
    }

    const languageName = languageMap[targetLanguage] || targetLanguage;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text into ${languageName}. Maintain the original tone, meaning, and format. If there are any idioms or cultural references, adapt them appropriately for the target language.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error(`Failed to translate text: ${error.message}`);
  }
}

/**
 * Translates segmented text with timestamps
 *
 * @param {Array} segments - Array of segments with text and timestamps
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<Array>} - Translated segments with preserved timestamps
 */
export async function translateSegments(segments, targetLanguage) {
  try {
    if (!segments || segments.length === 0) {
      throw new Error("No segments provided for translation");
    }

    const languageName = languageMap[targetLanguage] || targetLanguage;

    // Extract all segment texts
    const textsToTranslate = segments.map((segment) => segment.text);

    // Create a JSON string of the array to preserve formatting
    const jsonInput = JSON.stringify(textsToTranslate);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following JSON array of text segments into ${languageName}. Maintain the original tone and meaning. Return only the translated JSON array with the same structure, no explanations.`,
        },
        {
          role: "user",
          content: jsonInput,
        },
      ],
      temperature: 0.3,
    });

    // Parse the translated JSON array
    const translatedTexts = JSON.parse(response.choices[0].message.content);

    // Combine translated texts with original timestamps
    return segments.map((segment, index) => ({
      ...segment,
      text: translatedTexts[index] || segment.text,
    }));
  } catch (error) {
    console.error("Segment translation error:", error);
    throw new Error(`Failed to translate segments: ${error.message}`);
  }
}
