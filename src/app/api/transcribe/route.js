import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { OpenAI } from "openai";
import { extractAudioFromVideo } from "../../../lib/videoProcessing";
import { transcribeAudio } from "../../../lib/transcriptionService";

// Configure OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get("video");

    if (!videoFile) {
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 }
      );
    }

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), "tmp");
    try {
      await fs.access(tempDir);
    } catch {
      await fs.mkdir(tempDir, { recursive: true });
    }

    // Create unique filenames based on timestamp
    const timestamp = Date.now();
    const videoPath = path.join(tempDir, `video_${timestamp}.mp4`);
    const audioPath = path.join(tempDir, `audio_${timestamp}.mp3`);

    // Save the uploaded video file
    const videoArrayBuffer = await videoFile.arrayBuffer();
    const videoBuffer = Buffer.from(videoArrayBuffer);
    await fs.writeFile(videoPath, videoBuffer);

    // Extract audio from video
    await extractAudioFromVideo(videoPath, audioPath);

    // Transcribe the audio
    const transcript = await transcribeAudio(audioPath);

    // Clean up temporary files
    await fs.unlink(videoPath);
    await fs.unlink(audioPath);

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
