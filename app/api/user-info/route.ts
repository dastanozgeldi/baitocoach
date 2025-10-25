import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle";
import { userInfo, user } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "nameRomaji",
      "nationality",
      "studentStatus",
      "jobTypeInterested",
      "daysAvailable",
      "hoursPerWeek",
      "timePreference",
      "japaneseLevel",
      "preferredContactMethod",
      "contactDetails",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate arrays
    if (!Array.isArray(body.daysAvailable) || body.daysAvailable.length === 0) {
      return NextResponse.json(
        { error: "daysAvailable must be a non-empty array" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.timePreference) || body.timePreference.length === 0) {
      return NextResponse.json(
        { error: "timePreference must be a non-empty array" },
        { status: 400 }
      );
    }

    // Generate a unique ID for user_info
    const userInfoId = `${session.user.id}_info_${Date.now()}`;

    // Insert user info
    // @ts-expect-error - Type mismatch due to duplicate drizzle-orm versions in node_modules
    await db.insert(userInfo).values({
      id: userInfoId,
      userId: session.user.id,
      nameRomaji: body.nameRomaji,
      nationality: body.nationality,
      studentStatus: body.studentStatus,
      jobTypeInterested: body.jobTypeInterested,
      daysAvailable: JSON.stringify(body.daysAvailable),
      hoursPerWeek: body.hoursPerWeek,
      timePreference: JSON.stringify(body.timePreference),
      hasExperience: body.hasExperience ?? false,
      experienceDescription: body.experienceDescription || null,
      japaneseLevel: body.japaneseLevel,
      dietaryRestrictions: body.dietaryRestrictions || null,
      preferredContactMethod: body.preferredContactMethod,
      contactDetails: body.contactDetails,
    });

    // Update user's onboarding status
    // @ts-expect-error - Type mismatch due to duplicate drizzle-orm versions in node_modules
    await db.update(user).set({ isOnboarded: true }).where(eq(user.id, session.user.id));

    return NextResponse.json(
      { message: "User information saved successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving user info:", error);
    return NextResponse.json(
      { error: "Failed to save user information" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user info using select
    // @ts-expect-error - Type mismatch due to duplicate drizzle-orm versions in node_modules
    const results = await db.select().from(userInfo).where(eq(userInfo.userId, session.user.id)).limit(1);

    if (!results || results.length === 0) {
      return NextResponse.json(
        { error: "User information not found" },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = results[0] as any;

    // Parse JSON fields
    const parsedResult = {
      ...result,
      daysAvailable: JSON.parse(result.daysAvailable as string),
      timePreference: JSON.parse(result.timePreference as string),
    };

    return NextResponse.json(parsedResult);
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json(
      { error: "Failed to fetch user information" },
      { status: 500 }
    );
  }
}
