import { db } from "@/drizzle";
import { userInfo } from "@/drizzle/schema";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { transcription, userId } = await req.json();

    if (!transcription) {
      return Response.json(
        { error: "No transcription provided" },
        { status: 400 }
      );
    }

    // Get user info from database
    const info = await db.query.userInfo.findFirst({
      where: eq(userInfo.userId, userId || "fY7s72X4iKNAgpt3UKvjQKUex5vyRKCB"),
    });

    const systemPrompt = `You are assisting an international student in Japan who is on a phone call 
inquiring about part-time work. The student has limited Japanese ability.

Student Profile:
- Name: ${info?.nameRomaji || "Student"}
- Job type: ${info?.jobTypeInterested || "Various positions"}
- Available days: ${info?.daysAvailable || "Flexible"}
- Hours per week: ${info?.hoursPerWeek || "Flexible"} hours
- Time preference: ${info?.timePreference || "Flexible"}
- Experience: ${info?.hasExperience ? info.experienceDescription : "No prior experience"}
- Japanese level: ${info?.japaneseLevel || "Beginner"}
- Contact: ${info?.preferredContactMethod || "phone"}

The business owner just said: "${transcription}"

Generate a natural, polite Japanese response that:
1. Answers their question truthfully based on the student's profile
2. Is appropriate for a beginner Japanese speaker (simple grammar, short sentences)
3. Is culturally appropriate for a job inquiry call (use polite form)
4. Keeps the conversation moving toward scheduling an interview
5. Is honest about limitations but emphasizes willingness to learn

If the business owner asks about Japanese ability, be honest but positive (e.g., "まだ勉強中ですが、頑張ります" - I'm still studying but I'll do my best).`;

    const result = await generateObject({
      model: openai("gpt-4o"),
      schema: z.object({
        japanese: z.string().describe("Response in Japanese characters"),
        romaji: z.string().describe("Response in romaji (romanized Japanese)"),
        english: z.string().describe("English translation of the response"),
      }),
      prompt: systemPrompt,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error("Response generation error:", error);
    return Response.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}

