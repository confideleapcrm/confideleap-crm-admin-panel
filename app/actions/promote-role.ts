// Promote role on server
"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

export async function promoteRole(targetUserId: string, newRole: string) {
  const { userId } = auth();
  if (!userId) return;

  // Optional: check if current user is admin
  const currentUser = await clerkClient.users.getUser(userId);
  if (currentUser.publicMetadata?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  // Set role safely
  await clerkClient.users.updateUser(targetUserId, {
    publicMetadata: { role: newRole },
  });
}
