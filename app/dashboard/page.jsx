"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import DeveloperDashboard from "@/components/dashboards/DeveloperDashboard";
import UserDashboard from "@/components/dashboards/UserDashboard";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push("/signin");
      } else {
        const userRole = user?.unsafeMetadata?.role || "user";
        console.log("userRole ", userRole);
        setRole(userRole);
      }
    }
  }, [user, isLoaded, router]);

  if (!isLoaded || !role) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {role === "admin" && <AdminDashboard />}
      {role === "developer" && <DeveloperDashboard />}
      {role === "user" && <UserDashboard />}
    </DashboardLayout>
  );
}
