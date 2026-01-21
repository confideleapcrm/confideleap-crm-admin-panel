"use client";

import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Code,
  GitBranch,
  Terminal,
  Zap,
  FileCode,
  Database,
} from "lucide-react";

export default function DeveloperDashboard() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Hello, {user?.firstName}! 💻
        </h1>
        <p className="text-purple-100">Ready to build something amazing?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Requests</CardTitle>
            <Terminal className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24,531</div>
            <p className="text-xs text-slate-500 mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <GitBranch className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-slate-500 mt-1">5 active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployments</CardTitle>
            <Zap className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-slate-500 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Code Quality</CardTitle>
            <Code className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">A+</div>
            <p className="text-xs text-green-600 mt-1">Excellent</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Developer Tools</CardTitle>
            <CardDescription>Access your development resources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <FileCode className="mr-2 h-4 w-4" />
              API Documentation
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Terminal className="mr-2 h-4 w-4" />
              API Console
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Database className="mr-2 h-4 w-4" />
              Database Explorer
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Commits</CardTitle>
            <CardDescription>Your latest code changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  message: "Add user authentication",
                  branch: "main",
                  time: "2 hours ago",
                },
                {
                  message: "Fix API rate limiting",
                  branch: "dev",
                  time: "5 hours ago",
                },
                {
                  message: "Update dependencies",
                  branch: "main",
                  time: "1 day ago",
                },
              ].map((commit, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start text-sm"
                >
                  <div>
                    <p className="font-medium">{commit.message}</p>
                    <p className="text-xs text-slate-500">{commit.branch}</p>
                  </div>
                  <p className="text-xs text-slate-500">{commit.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Status */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>Status of your API services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { endpoint: "/api/users", status: "Active", latency: "45ms" },
              { endpoint: "/api/auth", status: "Active", latency: "32ms" },
              { endpoint: "/api/data", status: "Active", latency: "78ms" },
              { endpoint: "/api/webhooks", status: "Active", latency: "21ms" },
            ].map((api, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <code className="text-sm font-mono">{api.endpoint}</code>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-slate-500">{api.latency}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    {api.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
