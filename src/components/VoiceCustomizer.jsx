"use client";

import { useState } from "react";
import { useMediaRecorder } from "react-media-recorder";

export default function VoiceCustomizer({ onSynthesize, isProcessing }) {
  const [voiceType, setVoiceType] = useState("custom");
  const [voiceSample, setVoiceSample] = useState(null);
  const [isPitchAdjusted, setIsPitchAdjusted] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [speed, setSpeed] = useState(1);

  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } =
    useMediaRecorder({
      audio: true,
      video: false,
      onStop: (blobUrl, blob) => {
        setVoiceSample(blob);
      },
    });

  const handleVoiceTypeChange = (e) => {
    setVoiceType(e.target.value);
    if (e.target.value !== "custom") {
      clearBlobUrl();
      setVoiceSample(null);
    }
  };

  const handlePitchChange = (e) => {
    setPitch(parseFloat(e.target.value));
  };

  const handleSpeedChange = (e) => {
    setSpeed(parseFloat(e.target.value));
  };

  const handleSynthesize = () => {
    const voiceSettings = {
      type: voiceType,
      pitch,
      speed,
      sampleBlob: voiceSample,
    };

    onSynthesize(voiceSettings);
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="voiceType"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Voice Type
        </label>
        <select
          id="voiceType"
          value={voiceType}
          onChange={handleVoiceTypeChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="default">Default Voice</option>
          <option value="custom">Custom Voice (Your Voice)</option>
          <option value="male1">Male Voice 1</option>
          <option value="female1">Female Voice 1</option>
        </select>
      </div>

      {voiceType === "custom" && (
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium mb-2">Record Voice Sample</h3>
          <p className="text-sm text-gray-600 mb-3">
            Record a short sample of your voice for cloning. For best results,
            speak clearly for at least 30 seconds in the target language.
          </p>

          <div className="flex items-center space-x-4">
            {status !== "recording" ? (
              <button
                onClick={startRecording}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Stop Recording
              </button>
            )}

            {status === "recording" && (
              <div className="flex items-center">
                <span className="animate-pulse h-3 w-3 bg-red-500 rounded-full mr-2"></span>
                <span>Recording...</span>
              </div>
            )}
          </div>

          {mediaBlobUrl && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-1">Preview:</h4>
              <audio src={mediaBlobUrl} controls className="w-full" />
            </div>
          )}
        </div>
      )}

      <div>
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="adjustPitch"
            checked={isPitchAdjusted}
            onChange={() => setIsPitchAdjusted(!isPitchAdjusted)}
            className="mr-2"
          />
          <label
            htmlFor="adjustPitch"
            className="text-sm font-medium text-gray-700"
          >
            Adjust Voice Settings
          </label>
        </div>

        {isPitchAdjusted && (
          <div className="space-y-3">
            <div>
              <label
                htmlFor="pitch"
                className="block text-sm text-gray-700 mb-1"
              >
                Pitch: {pitch.toFixed(1)}
              </label>
              <input
                type="range"
                id="pitch"
                min="-10"
                max="10"
                step="0.1"
                value={pitch}
                onChange={handlePitchChange}
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="speed"
                className="block text-sm text-gray-700 mb-1"
              >
                Speed: {speed.toFixed(1)}x
              </label>
              <input
                type="range"
                id="speed"
                min="0.5"
                max="2"
                step="0.1"
                value={speed}
                onChange={handleSpeedChange}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleSynthesize}
        disabled={isProcessing || (voiceType === "custom" && !voiceSample)}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isProcessing ? "Generating Voice..." : "Generate Voice"}
      </button>
    </div>
  );
}
