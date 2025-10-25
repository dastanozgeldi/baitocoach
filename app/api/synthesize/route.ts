import { openai } from "@ai-sdk/openai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return Response.json({ error: "No text provided" }, { status: 400 });
    }

    // Use OpenAI's TTS API
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: "alloy", // You can use: alloy, echo, fable, onyx, nova, shimmer
        input: text,
        speed: 0.9, // Slightly slower for learning
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("TTS error:", error);
      throw new Error("Failed to synthesize speech");
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Speech synthesis error:", error);
    return Response.json(
      { error: "Failed to synthesize speech" },
      { status: 500 }
    );
  }
}

