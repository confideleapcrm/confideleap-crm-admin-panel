"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert, Home } from "lucide-react";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldAlert className="h-10 w-10 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            403 - Access Denied
          </CardTitle>
          <CardDescription className="text-base">
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            This page requires a specific role that you don't currently have.
            Please contact your administrator if you believe this is an error.
          </p>
          <Button onClick={() => router.push("/dashboard")} className="w-full">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
