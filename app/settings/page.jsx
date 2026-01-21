"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Calendar, Shield, Bell, Lock, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const { user } = useUser();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              View and manage your profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue={user?.firstName} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue={user?.lastName} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.primaryEmailAddress?.emailAddress}
                disabled
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                To update your profile information, please use the Clerk User
                Profile component or contact support.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Information about your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-medium">Role</p>
                    <p className="text-sm text-slate-500">
                      Your current access level
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 capitalize">
                  {user?.publicMetadata?.role || "user"}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-medium">Member Since</p>
                    <p className="text-sm text-slate-500">
                      Account creation date
                    </p>
                  </div>
                </div>
                <span className="text-sm text-slate-700">
                  {new Date(user?.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-medium">Account Status</p>
                    <p className="text-sm text-slate-500">
                      Current account state
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                  Active
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Manage how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-slate-500">
                    Receive updates via email
                  </p>
                </div>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-slate-500">
                    Receive push notifications
                  </p>
                </div>
              </div>
              <Switch
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <Lock className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-slate-500">
                    Add an extra layer of security
                  </p>
                </div>
              </div>
              <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
            </div>

            <Separator />

            <div className="pt-2">
              <Button variant="outline" className="w-full sm:w-auto">
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Danger Zone</CardTitle>
            <CardDescription>Irreversible account actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-slate-500">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
