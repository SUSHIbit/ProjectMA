import { OpenAI } from "openai";
import fs from "node:fs/promises";

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
    const fileBuffer = await fs.readFile(audioFilePath);
    
    // Create a File object from the buffer
    const file = new File([fileBuffer], "audio.mp3", { type: "audio/mpeg" });

    const response = await openai.audio.transcriptions.create({
      file: file,
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