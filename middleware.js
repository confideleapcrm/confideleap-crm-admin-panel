import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/signin(.*)",
  "/signup(.*)",
  "/sso-callback(.*)",
  "/api/webhooks(.*)",
  "/api/auth/register", // ✅ ADD THIS
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isDeveloperRoute = createRouteMatcher(["/developer(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = auth();

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to signin
  if (!userId) {
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Fetch user to get publicMetadata
  const user = await clerkClient.users.getUser(userId);
  const userRole = user?.publicMetadata?.role || "user";

  // Protect /admin routes - only admins
  if (isAdminRoute(req)) {
    if (userRole !== "admin") {
      const forbiddenUrl = new URL("/403", req.url);
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  // Protect /developer routes - admins and developers
  if (isDeveloperRoute(req)) {
    if (userRole !== "admin" && userRole !== "developer") {
      const forbiddenUrl = new URL("/403", req.url);
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
