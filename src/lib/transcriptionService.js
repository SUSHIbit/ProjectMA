import { OpenAI } from "openai";
import fs from "fs";

// Configure OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcribes audio file to text using OpenAI's Whisper API
 *
 * @param {string} audioFilePath - Path to the audio file
 * @returns {Promise<string>} - Transcribed text
 */
export async function transcribeAudio(audioFilePath) {
  try {
    const fileStream = fs.createReadStream(audioFilePath);

    const response = await openai.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-1",
      language: "en", // Auto-detect language if not specified
      response_format: "text",
    });

    return response;
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
}

/**
 * Detects the language of spoken audio
 *
 * @param {string} audioFilePath - Path to the audio file
 * @returns {Promise<string>} - Detected language code
 */
export async function detectLanguage(audioFilePath) {
  try {
    const fileStream = fs.createReadStream(audioFilePath);

    const response = await openai.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-1",
      response_format: "verbose_json",
    });

    return response.language;
  } catch (error) {
    console.error("Language detection error:", error);
    throw new Error(`Failed to detect language: ${error.message}`);
  }
}

/**
 * Segments audio into chunks with timestamps
 *
 * @param {string} audioFilePath - Path to the audio file
 * @returns {Promise<Array>} - Array of segment objects with timestamps
 */
export async function getAudioSegments(audioFilePath) {
  try {
    const fileStream = fs.createReadStream(audioFilePath);

    const response = await openai.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment", "word"],
    });

    return response.segments;
  } catch (error) {
    console.error("Audio segmentation error:", error);
    throw new Error(`Failed to segment audio: ${error.message}`);
  }
}
