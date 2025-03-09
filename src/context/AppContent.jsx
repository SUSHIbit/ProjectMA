"use client";

import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [editedTranscript, setEditedTranscript] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("ms"); // Default to Malay
  const [translatedText, setTranslatedText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState(null);

  // Reset state for a new project
  const resetState = () => {
    setVideoFile(null);
    setVideoUrl("");
    setTranscript("");
    setEditedTranscript("");
    setTranslatedText("");
    setAudioUrl("");
    setIsProcessing(false);
    setCurrentStep(1);
    setError(null);
  };

  // Set error and handle error state
  const handleError = (errorMessage) => {
    setError(errorMessage);
    setIsProcessing(false);
  };

  return (
    <AppContext.Provider
      value={{
        videoFile,
        setVideoFile,
        videoUrl,
        setVideoUrl,
        transcript,
        setTranscript,
        editedTranscript,
        setEditedTranscript,
        targetLanguage,
        setTargetLanguage,
        translatedText,
        setTranslatedText,
        audioUrl,
        setAudioUrl,
        isProcessing,
        setIsProcessing,
        currentStep,
        setCurrentStep,
        error,
        setError,
        resetState,
        handleError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
