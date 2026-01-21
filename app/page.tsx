"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Users, Zap } from "lucide-react";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, isLoaded, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">
                AdminPanel
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/signin")}>
                Sign In
              </Button>
              <Button onClick={() => router.push("/signup")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="h-4 w-4" />
            <span>Enterprise-Grade Access Control</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
            Professional Admin Panel
            <br />
            <span className="text-blue-600">with RBAC Built-In</span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Secure, scalable, and production-ready admin dashboard with
            role-based access control, powered by Clerk Authentication.
          </p>

          <div className="flex items-center justify-center space-x-4 pt-4">
            <Button
              size="lg"
              onClick={() => router.push("/signup")}
              className="px-8"
            >
              Create Account
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/signin")}
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Role-Based Access
            </h3>
            <p className="text-slate-600">
              Granular permissions with Admin, Developer, and User roles. Secure
              route protection at middleware level.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Clerk Authentication
            </h3>
            <p className="text-slate-600">
              Email/password and Google OAuth support with custom UI. Email
              verification included.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Production Ready
            </h3>
            <p className="text-slate-600">
              Built with Next.js App Router, shadcn/ui, and Tailwind CSS. Clean
              architecture and best practices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
