"use client";

export default function AudioPlayer({ audioUrl }) {
  if (!audioUrl) return null;

  return (
    <div className="w-full bg-gray-100 p-4 rounded-lg">
      <audio src={audioUrl} controls className="w-full" />
    </div>
  );
}
