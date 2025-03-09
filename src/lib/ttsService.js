import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

// Configure OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates speech from text using OpenAI's TTS API
 *
 * @param {string} text - Text to synthesize
 * @param {string} voice - Voice ID to use
 * @param {string} outputPath - Path to save the audio file
 * @returns {Promise<string>} - Path to the generated audio file
 */
export async function generateSpeech(text, voice = "alloy", outputPath) {
  try {
    if (!text) {
      throw new Error("No text provided for speech synthesis");
    }

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(outputPath, buffer);

    return outputPath;
  } catch (error) {
    console.error("Speech synthesis error:", error);
    throw new Error(`Failed to generate speech: ${error.message}`);
  }
}

/**
 * Modifies audio properties like pitch and speed
 *
 * @param {string} inputPath - Path to the input audio file
 * @param {string} outputPath - Path to save the modified audio file
 * @param {number} pitch - Pitch adjustment value (-10 to 10)
 * @param {number} speed - Speed adjustment value (0.5 to 2.0)
 * @returns {Promise<string>} - Path to the modified audio file
 */
export function modifyAudio(inputPath, outputPath, pitch = 0, speed = 1.0) {
  return new Promise((resolve, reject) => {
    try {
      // Prepare FFmpeg filter complex for audio modification
      const filterComplex = [];

      if (speed !== 1.0) {
        filterComplex.push(`atempo=${speed}`);
      }

      if (pitch !== 0) {
        // Convert pitch adjustment to semitones (for FFmpeg's pitch filter)
        const pitchSemitones = pitch / 2;
        filterComplex.push(
          `asetrate=44100*2^(${pitchSemitones}/12),aresample=44100`
        );
      }

      // Build FFmpeg command
      const ffmpegArgs = ["-i", inputPath];

      if (filterComplex.length > 0) {
        ffmpegArgs.push("-af", filterComplex.join(","));
      }

      ffmpegArgs.push(outputPath);

      // Execute FFmpeg command
      const ffmpeg = spawn("ffmpeg", ffmpegArgs);

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          resolve(outputPath);
        } else {
          reject(new Error(`FFmpeg process exited with code ${code}`));
        }
      });

      ffmpeg.stderr.on("data", (data) => {
        console.log(`FFmpeg stderr: ${data}`);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generates speech from segmented text with timing information
 *
 * @param {Array} segments - Array of segments with text and timestamps
 * @param {string} voice - Voice ID to use
 * @param {string} outputPath - Path to save the audio file
 * @returns {Promise<string>} - Path to the generated audio file
 */
export async function generateSegmentedSpeech(
  segments,
  voice = "alloy",
  outputPath
) {
  try {
    if (!segments || segments.length === 0) {
      throw new Error("No segments provided for speech synthesis");
    }

    const tempDir = path.dirname(outputPath);
    const segmentAudioPaths = [];

    // Generate audio for each segment
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const segmentPath = path.join(tempDir, `segment_${i}.mp3`);

      await generateSpeech(segment.text, voice, segmentPath);
      segmentAudioPaths.push(segmentPath);
    }

    // Create a file list for FFmpeg
    const fileListPath = path.join(tempDir, "filelist.txt");
    const fileListContent = segmentAudioPaths
      .map((p) => `file '${p}'`)
      .join("\n");
    await fs.promises.writeFile(fileListPath, fileListContent);

    // Concatenate all segment audio files
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        fileListPath,
        "-c",
        "copy",
        outputPath,
      ]);

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg concat process exited with code ${code}`));
        }
      });

      ffmpeg.stderr.on("data", (data) => {
        console.log(`FFmpeg stderr: ${data}`);
      });
    });

    // Clean up temporary files
    for (const segmentPath of segmentAudioPaths) {
      await fs.promises.unlink(segmentPath);
    }
    await fs.promises.unlink(fileListPath);

    return outputPath;
  } catch (error) {
    console.error("Segmented speech synthesis error:", error);
    throw new Error(`Failed to generate segmented speech: ${error.message}`);
  }
}
