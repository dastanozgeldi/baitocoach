import { db } from "@/drizzle";
import { userInfo } from "@/drizzle/schema";
import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { eq } from "drizzle-orm";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const info = await db.query.userInfo.findFirst({
    where: eq(userInfo.userId, "fY7s72X4iKNAgpt3UKvjQKUex5vyRKCB"),
  });

  const prompt = `You are assisting an international student in Japan who is on a phone call 
inquiring about part-time work. The student has limited Japanese ability.

Student Profile:
- Name: ${info?.nameRomaji}
- Job type: ${info?.jobTypeInterested}
- Available: ${info?.daysAvailable}
- Experience: ${info?.experienceDescription}
- Japanese level: ${info?.japaneseLevel}

The business owner just said: "{transcription}"

Generate a natural, polite Japanese response that:
1. Answers their question truthfully based on the student's profile
2. Is appropriate for a beginner Japanese speaker (simple grammar)
3. Is culturally appropriate for a job inquiry call
4. Keeps the conversation moving toward scheduling an interview

Return JSON:
{
  "japanese": "response in Japanese",
  "romaji": "response in romaji",
  "english": "English translation"
}`;

  const result = streamText({
    model: openai("gpt-4o"),
    messages: [
      { role: "system", content: prompt },
      ...convertToModelMessages(messages),
    ],
  });

  return result.toUIMessageStreamResponse();
}
