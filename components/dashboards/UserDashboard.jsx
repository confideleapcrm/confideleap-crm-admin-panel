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
import { User, Mail, Calendar, Shield, Settings, Bell } from "lucide-react";

export default function UserDashboard() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {user?.firstName}! 🎉
        </h1>
        <p className="text-green-100">Great to see you today</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-slate-200 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-slate-600" />
              </div>
              <div>
                <p className="font-semibold text-lg">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-slate-500">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 pt-4">
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                <Mail className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-medium">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                <Shield className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-500">Role</p>
                  <p className="text-sm font-medium capitalize">
                    {user?.publicMetadata?.role || "user"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                <Calendar className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-500">Member Since</p>
                  <p className="text-sm font-medium">
                    {new Date(user?.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                <User className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-500">Account Status</p>
                  <p className="text-sm font-medium text-green-600">Active</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Shield className="mr-2 h-4 w-4" />
              Privacy & Security
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Signed in", time: "Just now" },
                { action: "Updated profile", time: "2 days ago" },
                { action: "Changed password", time: "1 week ago" },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm"
                >
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
            <User className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-slate-500 mt-1">Since registration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Login</CardTitle>
            <Calendar className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Today</div>
            <p className="text-xs text-slate-500 mt-1">
              at {new Date().toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Account Health
            </CardTitle>
            <Shield className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Secure</div>
            <p className="text-xs text-green-600 mt-1">All checks passed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
