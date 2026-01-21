"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, GitBranch, Terminal, FileCode, AlertCircle } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function DeveloperPage() {
  const { user, isLoaded } = useUser();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      const userRole = user?.publicMetadata?.role;
      setHasAccess(userRole === "admin" || userRole === "developer");
      setLoading(false);
    }
  }, [user, isLoaded]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Developer Portal
          </h1>
          <p className="text-slate-600 mt-2">
            API keys, documentation, and development tools
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Calls</CardTitle>
              <Terminal className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45,231</div>
              <p className="text-xs text-slate-500">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Projects
              </CardTitle>
              <GitBranch className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-slate-500">3 in development</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Code Commits
              </CardTitle>
              <Code className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">152</div>
              <p className="text-xs text-slate-500">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Documentation
              </CardTitle>
              <FileCode className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-slate-500">Pages</p>
            </CardContent>
          </Card>
        </div>

        {/* Developer Tools */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>Manage API keys and endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                View API Keys
              </Button>
              <Button className="w-full" variant="outline">
                API Documentation
              </Button>
              <Button className="w-full" variant="outline">
                Rate Limits
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Development Tools</CardTitle>
              <CardDescription>
                Tools and resources for developers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                Code Sandbox
              </Button>
              <Button className="w-full" variant="outline">
                Webhooks
              </Button>
              <Button className="w-full" variant="outline">
                Testing Console
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* API Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>Available API Endpoints</CardTitle>
            <CardDescription>
              RESTful API endpoints for your applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  method: "GET",
                  endpoint: "/api/users",
                  description: "Get all users",
                },
                {
                  method: "POST",
                  endpoint: "/api/users",
                  description: "Create new user",
                },
                {
                  method: "GET",
                  endpoint: "/api/analytics",
                  description: "Get analytics data",
                },
                {
                  method: "PUT",
                  endpoint: "/api/settings",
                  description: "Update settings",
                },
              ].map((api, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        api.method === "GET"
                          ? "bg-green-100 text-green-700"
                          : api.method === "POST"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {api.method}
                    </span>
                    <code className="text-sm font-mono">{api.endpoint}</code>
                  </div>
                  <p className="text-xs text-slate-500">{api.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
