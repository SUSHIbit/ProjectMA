import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { OpenAI } from "openai";
import { spawn } from "child_process";

// Configure OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Process voice sample for cloning
async function processVoiceSample(samplePath) {
  // This is a placeholder for actual voice processing
  // In a real implementation, you would use a voice cloning service API
  console.log("Processing voice sample:", samplePath);
  return samplePath;
}

// Apply voice modifications (pitch, speed)
async function modifyAudio(inputPath, outputPath, pitch, speed) {
  return new Promise((resolve, reject) => {
    // Using FFmpeg to modify audio properties
    const ffmpeg = spawn("ffmpeg", [
      "-i",
      inputPath,
      "-af",
      `asetrate=44100*${speed},aresample=44100,atempo=1/>${speed},atempo=1/>${speed},atempo=1/>${speed},aresample=44100:resampler=soxr,aformat=sample_fmts=s16:sample_rates=44100:channel_layouts=stereo,highpass=frequency=200,lowpass=frequency=3000,equalizer=f=1000:width_type=h:width=200:g=${pitch}`,
      outputPath,
    ]);

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg process exited with code ${code}`));
      }
    });

    ffmpeg.stderr.on("data", (data) => {
      console.log(`FFmpeg stderr: ${data}`);
    });
  });
}

export async function POST(request) {
  try {
    const { text, voiceSettings, sourceAudioUrl } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), "tmp");
    try {
      await fs.access(tempDir);
    } catch {
      await fs.mkdir(tempDir, { recursive: true });
    }

    // Create unique file paths
    const timestamp = Date.now();
    const outputDir = path.join(process.cwd(), "public", "output");
    try {
      await fs.access(outputDir);
    } catch {
      await fs.mkdir(outputDir, { recursive: true });
    }

    // TTS voice selection based on settings
    let voice = "alloy"; // Default OpenAI voice

    if (voiceSettings.type === "male1") {
      voice = "onyx";
    } else if (voiceSettings.type === "female1") {
      voice = "nova";
    }

    // If custom voice, process the voice sample
    let customVoiceId = null;
    if (voiceSettings.type === "custom" && voiceSettings.sampleBlob) {
      // Save voice sample to a file
      const sampleBuffer = Buffer.from(
        await voiceSettings.sampleBlob.arrayBuffer()
      );
      const samplePath = path.join(tempDir, `voice_sample_${timestamp}.mp3`);
      await fs.writeFile(samplePath, sampleBuffer);

      // Process voice sample for cloning (in real app, integrate with ElevenLabs or similar)
      customVoiceId = await processVoiceSample(samplePath);
    }

    // Generate speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const initialAudioPath = path.join(tempDir, `tts_${timestamp}.mp3`);
    await fs.writeFile(initialAudioPath, buffer);

    // Apply voice modifications if needed
    let finalAudioPath;
    if (voiceSettings.pitch !== 0 || voiceSettings.speed !== 1) {
      finalAudioPath = path.join(tempDir, `modified_${timestamp}.mp3`);
      await modifyAudio(
        initialAudioPath,
        finalAudioPath,
        voiceSettings.pitch,
        voiceSettings.speed
      );
    } else {
      finalAudioPath = initialAudioPath;
    }

    // Copy final audio to public directory for client access
    const publicAudioPath = path.join(outputDir, `translated_${timestamp}.mp3`);
    const audioBuffer = await fs.readFile(finalAudioPath);
    await fs.writeFile(publicAudioPath, audioBuffer);

    // Clean up temp files
    if (finalAudioPath !== initialAudioPath) {
      await fs.unlink(initialAudioPath);
      await fs.unlink(finalAudioPath);
    } else {
      await fs.unlink(initialAudioPath);
    }

    // Return the URL to the generated audio
    const audioUrl = `/output/translated_${timestamp}.mp3`;

    return NextResponse.json({ audioUrl });
  } catch (error) {
    console.error("Speech synthesis error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
