// app/api/interview/transcribe/route.ts
// Proxies audio to Groq's Whisper API (free tier, very fast)
//
// Setup:
//   1. Sign up at https://console.groq.com — free, no card required
//   2. Create an API key


import { NextRequest, NextResponse } from "next/server";
import { getGroqApiKey } from "@/lib/env";

export const runtime = "nodejs"; // edge runtime doesn't support FormData file streams well

export async function POST(req: NextRequest) {
  const groqApiKey = getGroqApiKey();

  if (!groqApiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not set in environment variables." },
      { status: 500 }
    );
  }

  let audioFile: File | null = null;

  try {
    const formData = await req.formData();
    audioFile = formData.get("audio") as File | null;
  } catch {
    return NextResponse.json({ error: "Failed to parse form data." }, { status: 400 });
  }

  if (!audioFile || audioFile.size === 0) {
    return NextResponse.json({ error: "No audio file provided." }, { status: 400 });
  }

  // Groq Whisper accepts: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm
  // We send whatever the browser recorded (webm or ogg)
  const groqForm = new FormData();
  groqForm.append("file", audioFile, audioFile.name || "recording.webm");
  groqForm.append("model", "whisper-large-v3-turbo"); // free, fastest, very accurate
  groqForm.append("language", "en");
  groqForm.append("response_format", "json");

  try {
    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          // Do NOT set Content-Type — fetch sets it automatically with boundary for FormData
        },
        body: groqForm,
      }
    );

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq Whisper error:", errText);
      return NextResponse.json(
        { error: "Groq transcription failed.", detail: errText },
        { status: groqRes.status }
      );
    }

    const data = await groqRes.json();
    // Groq returns { text: "transcribed text here" }
    return NextResponse.json({ text: data.text ?? "" });
  } catch (err) {
    console.error("Transcribe route error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}