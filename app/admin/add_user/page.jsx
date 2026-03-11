"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactSelect from "react-select";
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

  const [companies, setCompanies] = useState([]);
  const [assignedCompanies, setAssignedCompanies] = useState([]);

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
    const fetchCompanies = async () => {
      try {
        const res = await fetch("/api/companies/get-companies");
        const data = await res.json();
        setCompanies(data.companies || []);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };
    fetchCompanies();
  }, []);

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
      setAssignedCompanies(
        (data.assigned_companies || []).map((id) => ({
          company_id: id,
          status: "Active",
        })),
      );
    };

    getUserById();
  }, [userId]);

  const generatePassword = (length = 12) => {
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|";

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
      assigned_companies: assignedCompanies
        .filter((c) => c.status === "Active")
        .map((c) => c.company_id),
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

    router.push("/admin");
  };

  const companyOptions = companies.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "0.5rem",
      borderColor: state.isFocused ? "#3b82f6" : "#e2e8f0",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
      padding: "2px",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#eff6ff",
      borderRadius: "9999px",
      padding: "2px 8px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#1d4ed8",
      fontWeight: "500",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#3b82f6",
      "&:hover": {
        backgroundColor: "#dbeafe",
        color: "#ef4444",
        borderRadius: "9999px",
      },
    }),
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
            <ShadcnSelect value={role} onValueChange={setRole}>
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
            </ShadcnSelect>
          </div>

          {/* Assign Companies */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Assign Companies</Label>

              <span className="text-xs text-muted-foreground">
                {assignedCompanies.filter((c) => c.status === "Active").length}{" "}
                Active
              </span>
            </div>

            <ReactSelect
              isMulti
              options={companyOptions}
              styles={selectStyles}
              value={companyOptions.filter((option) =>
                assignedCompanies.find(
                  (c) => c.company_id === option.value && c.status === "Active",
                ),
              )}
              onChange={(selected) => {
                const selectedIds = selected?.map((s) => s.value) || [];

                setAssignedCompanies((prev) => {
                  let updated = [...prev];

                  selectedIds.forEach((id) => {
                    const existing = updated.find((c) => c.company_id === id);

                    if (existing) {
                      existing.status = "Active";
                    } else {
                      updated.push({
                        company_id: id,
                        status: "Active",
                        assigned_at: new Date(),
                      });
                    }
                  });

                  updated = updated.map((c) =>
                    !selectedIds.includes(c.company_id)
                      ? { ...c, status: "Inactive" }
                      : c,
                  );

                  return updated;
                });
              }}
              placeholder="Search companies..."
              className="text-sm"
            />

            <p className="text-xs text-muted-foreground">
              Assign companies this user will manage.
            </p>
          </div>

          {/* Assigned Companies List */}
          {assignedCompanies.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-semibold">
                  Assigned Companies
                </Label>

                <span className="text-xs text-muted-foreground">
                  {assignedCompanies.length} total
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {assignedCompanies.map((company) => {
                  const companyData = companies.find(
                    (c) => String(c.id) === String(company.company_id),
                  );

                  const isActive = company.status === "Active";

                  return (
                    <div
                      key={company.company_id}
                      className="group flex items-center justify-between p-4 rounded-xl border bg-white hover:shadow-md transition"
                    >
                      {/* Left Section */}
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-semibold">
                          {companyData?.name?.[0] || "C"}
                        </div>

                        <div>
                          <p className="text-sm font-semibold">
                            {companyData?.name || "Unknown Company"}
                          </p>

                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={clsx(
                                "text-xs px-2 py-0.5 rounded-full font-medium",
                                isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600",
                              )}
                            >
                              {company.status}
                            </span>

                            {company.assigned_at && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  company.assigned_at,
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <button
                        type="button"
                        onClick={() => {
                          setAssignedCompanies((prev) =>
                            prev.map((c) =>
                              c.company_id === company.company_id
                                ? {
                                    ...c,
                                    status: isActive ? "Inactive" : "Active",
                                  }
                                : c,
                            ),
                          );
                        }}
                        className={clsx(
                          "text-xs px-3 py-1 rounded-md font-medium transition",
                          isActive
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100",
                        )}
                      >
                        {isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
