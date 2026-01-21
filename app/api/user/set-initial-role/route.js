import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    const { userId } = auth();
    const { role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Promote role to publicMetadata (trusted)
    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role },
      unsafeMetadata: {}, // optional cleanup
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error promoting role:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
