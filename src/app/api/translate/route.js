import { NextResponse } from "next/server";
import { translateText } from "../../../lib/translationService";

export async function POST(request) {
  try {
    const { text, targetLanguage } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    if (!targetLanguage) {
      return NextResponse.json({ error: "No target language specified" }, { status: 400 });
    }

    // Translate the text
    const translatedText = await translateText(text, targetLanguage);

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}