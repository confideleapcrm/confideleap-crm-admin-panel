"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  Target,
  Settings,
  BarChart3,
  Upload,
  Building,
} from "lucide-react";
import clsx from "clsx";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function AddUserPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("SDE");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("Social Media Analyst");
  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const isEditMode = Boolean(userId);

  const ALL_ROUTES = [
    { label: "Dashboard", icon: BarChart3, path: "/dashboard" },
    { label: "Investor Targeting", icon: Target, path: "/investor-targeting" },
    { label: "Investor Database", icon: Users, path: "/investor-database" },
    { label: "Import Investors", icon: Upload, path: "/import-investors" },
    { label: "Customer Database", icon: Building, path: "/customer-database" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ];

  const toggleRoute = (route) => {
    setAllowedRoutes((prev) =>
      prev.includes(route) ? prev.filter((r) => r !== route) : [...prev, route],
    );
  };

  useEffect(() => {
    if (!userId) return;

    const getUserById = async () => {
      const res = await fetch(`/api/user/get-users/${userId}`);
      const data = await res.json();

      setEmail(data.email);
      setFirstName(data.first_name);
      setLastName(data.last_name);
      setRole(data.role);
      setPassword("");
      setJobTitle(data.job_title);
      setDepartment(data.department);
      setAllowedRoutes(data.allowed_routes || []);
    };

    getUserById();
  }, [userId]);

  const generatePassword = (length = 12) => {
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|"; // Expanded symbols

    // Use crypto.getRandomValues for better security if in browser
    const getRandomChar = (str) => str[Math.floor(Math.random() * str.length)];

    let passwordArr = [
      getRandomChar(letters),
      getRandomChar(numbers),
      getRandomChar(symbols),
    ];

    const allChars = letters + numbers + symbols;
    for (let i = passwordArr.length; i < length; i++) {
      passwordArr.push(getRandomChar(allChars));
    }

    // Fisher-Yates Shuffle (Better than .sort())
    for (let i = passwordArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [passwordArr[i], passwordArr[j]] = [passwordArr[j], passwordArr[i]];
    }

    return passwordArr.join("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      email,
      first_name: firstName,
      last_name: lastName,
      job_title: jobTitle,
      department,
      role,
      allowed_routes: allowedRoutes,
    };

    if (password.trim()) {
      payload.password = password.trim();
    }
    const url = isEditMode
      ? `/api/user/get-users/${userId}`
      : `/api/user/add_user`;
    const method = isEditMode ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Failed to save user");
    }

    router.push("/admin"); // or wherever your user list is
  };

  return (
    <DashboardLayout>
      <div className=" pb-10">
        <h1 className="text-2xl font-semibold mb-6">Add New User</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
              />
            </div>

            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Email / Password */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>

            <div className="flex items-center gap-2">
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password or generate"
              />

              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const newPass = generatePassword();
                  setPassword(newPass);
                  setShowPassword(true); // auto-show generated password
                }}
              >
                Generate
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </Button>
            </div>
          </div>

          {/* Job info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Software Engineer"
              />
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Engineering"
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Social Media Analyst">
                  Social Media Analyst
                </SelectItem>
                <SelectItem value="Developer">Developer</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Investor Relations Analyst">
                  Investor Relations Analyst
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Allowed Routes */}
          <div className="space-y-2">
            <Label>Allowed Routes</Label>

            <div className="grid grid-cols-2 gap-3">
              {ALL_ROUTES.map((route) => {
                const active = allowedRoutes.includes(route.path);

                return (
                  <button
                    type="button"
                    key={route.path}
                    onClick={() => toggleRoute(route.path)}
                    className={clsx(
                      "border rounded-lg px-4 py-3 text-left transition",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted hover:border-primary/50",
                    )}
                  >
                    <div className="font-medium">{route.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {route.path}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? "Edit User" : "Create User"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
