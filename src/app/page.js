"use client";

import { useState } from "react";
import VideoUploader from "../components/VideoUploader";
import TranscriptEditor from "../components/TranscriptEditor";
import LanguageSelector from "../components/LanguageSelector";
import VoiceCustomizer from "../components/VoiceCustomizer";
import AudioPlayer from "../components/AudioPlayer";

export default function Home() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [editedTranscript, setEditedTranscript] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("ms"); // Default to Malay
  const [translatedText, setTranslatedText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleVideoUpload = async (file) => {
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setIsProcessing(true);
    setCurrentStep(1);

    // Upload video and get transcript
    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to transcribe video");

      const data = await response.json();
      setTranscript(data.transcript);
      setEditedTranscript(data.transcript);
      setIsProcessing(false);
      setCurrentStep(2);
    } catch (error) {
      console.error("Error:", error);
      setIsProcessing(false);
    }
  };

  const handleTranscriptEdit = (newTranscript) => {
    setEditedTranscript(newTranscript);
  };

  const handleLanguageChange = (language) => {
    setTargetLanguage(language);
  };

  const handleTranslate = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: editedTranscript,
          targetLanguage,
        }),
      });

      if (!response.ok) throw new Error("Failed to translate text");

      const data = await response.json();
      setTranslatedText(data.translatedText);
      setIsProcessing(false);
      setCurrentStep(3);
    } catch (error) {
      console.error("Error:", error);
      setIsProcessing(false);
    }
  };

  const handleSynthesize = async (voiceSettings) => {
    setIsProcessing(true);

    try {
      const response = await fetch("/api/synthesize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: translatedText,
          voiceSettings,
          sourceAudioUrl: videoUrl,
        }),
      });

      if (!response.ok) throw new Error("Failed to synthesize speech");

      const data = await response.json();
      setAudioUrl(data.audioUrl);
      setIsProcessing(false);
      setCurrentStep(4);
    } catch (error) {
      console.error("Error:", error);
      setIsProcessing(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Video Translation App
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Step 1: Upload Video</h2>
          <VideoUploader onUpload={handleVideoUpload} />

          {videoUrl && (
            <div className="mt-4">
              <video
                src={videoUrl}
                controls
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>

        <div>
          {currentStep >= 2 && (
            <>
              <h2 className="text-xl font-semibold mb-4">
                Step 2: Edit Transcript
              </h2>
              <TranscriptEditor
                transcript={transcript}
                onEdit={handleTranscriptEdit}
              />
              <button
                onClick={handleTranslate}
                disabled={isProcessing || !editedTranscript}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
              >
                {isProcessing ? "Translating..." : "Translate"}
              </button>
            </>
          )}

          {currentStep >= 3 && (
            <>
              <h2 className="text-xl font-semibold mt-8 mb-4">
                Step 3: Select Target Language
              </h2>
              <LanguageSelector
                selectedLanguage={targetLanguage}
                onChange={handleLanguageChange}
              />
              <div className="mt-4">
                <h3 className="font-medium mb-2">Translated Text:</h3>
                <div className="p-4 bg-gray-100 rounded-lg">
                  {translatedText || "Translation will appear here"}
                </div>
              </div>
            </>
          )}

          {currentStep >= 3 && (
            <>
              <h2 className="text-xl font-semibold mt-8 mb-4">
                Step 4: Customize Voice
              </h2>
              <VoiceCustomizer
                onSynthesize={handleSynthesize}
                isProcessing={isProcessing}
              />
            </>
          )}

          {currentStep >= 4 && audioUrl && (
            <>
              <h2 className="text-xl font-semibold mt-8 mb-4">
                Step 5: Final Audio
              </h2>
              <AudioPlayer audioUrl={audioUrl} />
              <div className="mt-4">
                <a
                  href={audioUrl}
                  download="translated_audio.mp3"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 inline-block"
                >
                  Download Audio
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
