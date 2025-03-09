import { OpenAI } from "openai";

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

    // Configure OpenAI client - we're putting it inside the function
    // to ensure it's only initialized on the server side
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

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
