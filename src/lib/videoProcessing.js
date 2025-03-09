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