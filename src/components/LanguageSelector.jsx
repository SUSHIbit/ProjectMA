"use client";

export default function LanguageSelector({ selectedLanguage, onChange }) {
  const languages = [
    { code: "ms", name: "Bahasa Melayu" },
    { code: "id", name: "Bahasa Indonesia" },
    { code: "zh", name: "Chinese (Mandarin)" },
    { code: "hi", name: "Hindi" },
    { code: "es", name: "Spanish" },
    { code: "ar", name: "Arabic" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
  ];

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <label
        htmlFor="language"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Target Language
      </label>
      <select
        id="language"
        value={selectedLanguage}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
