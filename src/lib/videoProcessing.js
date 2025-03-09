import fs from "fs";
import path from "path";
import { spawn } from "child_process";

/**
 * Extracts audio from a video file
 *
 * @param {string} videoPath - Path to the video file
 * @param {string} audioPath - Path to save the extracted audio
 * @returns {Promise<string>} - Path to the extracted audio file
 */
export function extractAudioFromVideo(videoPath, audioPath) {
  return new Promise((resolve, reject) => {
    try {
      const ffmpeg = spawn("ffmpeg", [
        "-i",
        videoPath,
        "-vn",
        "-acodec",
        "libmp3lame",
        "-ab",
        "128k",
        "-ar",
        "44100",
        audioPath,
      ]);

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          resolve(audioPath);
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
 * Creates a new video with the translated audio
 *
 * @param {string} videoPath - Path to the original video file
 * @param {string} audioPath - Path to the new audio file
 * @param {string} outputPath - Path to save the new video
 * @returns {Promise<string>} - Path to the new video file
 */
export function replaceAudioInVideo(videoPath, audioPath, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const ffmpeg = spawn("ffmpeg", [
        "-i",
        videoPath,
        "-i",
        audioPath,
        "-map",
        "0:v",
        "-map",
        "1:a",
        "-c:v",
        "copy",
        "-shortest",
        outputPath,
      ]);

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
 * Gets the duration of a video or audio file
 *
 * @param {string} filePath - Path to the media file
 * @returns {Promise<number>} - Duration in seconds
 */
export function getMediaDuration(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const ffprobe = spawn("ffprobe", [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        filePath,
      ]);

      let output = "";
      ffprobe.stdout.on("data", (data) => {
        output += data.toString();
      });

      ffprobe.on("close", (code) => {
        if (code === 0) {
          const duration = parseFloat(output.trim());
          resolve(duration);
        } else {
          reject(new Error(`FFprobe process exited with code ${code}`));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Creates a video with subtitles from segmented text
 *
 * @param {string} videoPath - Path to the video file
 * @param {Array} segments - Array of segments with text and timestamps
 * @param {string} outputPath - Path to save the subtitled video
 * @returns {Promise<string>} - Path to the subtitled video file
 */
export async function createSubtitledVideo(videoPath, segments, outputPath) {
  try {
    // Create a subtitle file (SRT format)
    const subtitlePath = path.join(path.dirname(outputPath), "subtitles.srt");

    let srtContent = "";
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const startTime = formatTimestamp(segment.start);
      const endTime = formatTimestamp(segment.end);

      srtContent += `${i + 1}\n`;
      srtContent += `${startTime} --> ${endTime}\n`;
      srtContent += `${segment.text}\n\n`;
    }

    await fs.promises.writeFile(subtitlePath, srtContent);

    // Add subtitles to video
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        "-i",
        videoPath,
        "-vf",
        `subtitles=${subtitlePath}`,
        "-c:a",
        "copy",
        outputPath,
      ]);

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
    });
  } catch (error) {
    console.error("Subtitled video creation error:", error);
    throw error;
  }
}

/**
 * Formats a timestamp in seconds to SRT format (HH:MM:SS,mmm)
 *
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted timestamp
 */
function formatTimestamp(seconds) {
  const date = new Date(seconds * 1000);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const secs = String(date.getUTCSeconds()).padStart(2, "0");
  const ms = String(date.getUTCMilliseconds()).padStart(3, "0");

  return `${hours}:${minutes}:${secs},${ms}`;
}
