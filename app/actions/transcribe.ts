"use server";

import { experimental_transcribe as transcribe } from "ai";
import { openai } from "@ai-sdk/openai";

export async function transcribeAudio(audioFile: Blob) {
  if (!audioFile) {
    throw new Error("No audio file provided");
  }

  // Convert Blob to Buffer
  const arrayBuffer = await audioFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Transcribe the audio
  const transcript = await transcribe({
    model: openai.transcription("whisper-1"),
    audio: buffer,
  });

  return {
    text: transcript.text,
    segments: transcript.segments,
    language: transcript.language,
    durationInSeconds: transcript.durationInSeconds,
  };
}

