"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();

  useEffect(() => {
    const complete = async () => {
      try {
        await handleRedirectCallback();
      } catch (error) {
        console.error("SSO callback error:", error);
        window.location.href = "/signin?error=sso_failed";
      }
    };
    complete();
  }, [handleRedirectCallback]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
        <h2 className="text-2xl font-semibold text-slate-900">
          Completing authentication...
        </h2>
        <p className="text-slate-600">Please wait while we sign you in.</p>
      </div>
    </div>
  );
}
