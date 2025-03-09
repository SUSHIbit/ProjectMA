"use client";

import { useState, useEffect } from "react";

export default function TranscriptEditor({ transcript, onEdit }) {
  const [editedText, setEditedText] = useState("");

  useEffect(() => {
    setEditedText(transcript);
  }, [transcript]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setEditedText(newText);
    onEdit(newText);
  };

  return (
    <div className="w-full">
      <textarea
        value={editedText}
        onChange={handleTextChange}
        placeholder="Transcript will appear here for editing..."
        className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="mt-2 text-sm text-gray-600">
        <p>Edit the transcript as needed before translation.</p>
      </div>
    </div>
  );
}
