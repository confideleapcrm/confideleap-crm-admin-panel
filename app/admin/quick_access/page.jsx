"use client";

import { useState, useEffect } from "react";
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
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactSelect from "react-select";
import {
  Users,
  Building,
  Plus,
  RefreshCw,
  Zap,
  UserPlus,
  Eye,
  Target,
  BarChart3,
  Upload,
  Settings,
  Edit,
  Globe,
  Tag,
  LayoutGrid
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import Link from "next/link";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";

export default function QuickAccessPage() {
  // User Form State
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "Social Media Analyst",
    jobTitle: "SDE",
    department: "",
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const activeCompanyId = searchParams.get("company_id");
  const isEditMode = Boolean(userId && userId !== 'null');

  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);

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

  // Company Form State
  const [companyData, setCompanyData] = useState({
    name: "",
    industry: "",
    domain: "",
    description: "",
  });

  // Assignment State
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // State to hold IDs until companies are fetched
  const [pendingAssignments, setPendingAssignments] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch("/api/companies/get-companies");
        const data = await res.json();
        setAvailableCompanies(data.companies || []);
      } catch (err) {
        console.error("Error fetching companies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  // Sync selected companies when BOTH pending IDs and availableCompanies are ready
  useEffect(() => {
    if (pendingAssignments.length > 0 && availableCompanies.length > 0) {
      const matched = availableCompanies
        .filter(c => pendingAssignments.includes(c.id))
        .map(c => ({ value: c.id, label: c.name }));
      
      setSelectedCompanies(matched);
      setPendingAssignments([]);
    }
  }, [pendingAssignments, availableCompanies]);

  useEffect(() => {
    if (!userId || userId === 'null') {
      setUserData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "Social Media Analyst",
        jobTitle: "SDE",
        department: "",
      });
      setAllowedRoutes([]);
      setSelectedCompanies([]);
      setPendingAssignments(activeCompanyId ? [activeCompanyId] : []);
      return;
    }

    const getUserById = async () => {
      setLoadingUser(true);
      try {
        const res = await fetch(`/api/user/get-users/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();

        setUserData({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || "",
          password: "", 
          role: data.role || "Social Media Analyst",
          jobTitle: data.job_title || "SDE",
          department: data.department || "",
        });
        setAllowedRoutes(data.allowed_routes || []);
        
        if (data.assigned_companies) {
          setPendingAssignments(data.assigned_companies);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        toast.error("Could not load user data");
      } finally {
        setLoadingUser(false);
      }
    };

    getUserById();
  }, [userId]);

  const companyOptions = availableCompanies.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const generatePassword = () => {
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|";
    const getRandomChar = (str) => str[Math.floor(Math.random() * str.length)];
    
    let pass = [getRandomChar(letters), getRandomChar(numbers), getRandomChar(symbols)];
    const all = letters + numbers + symbols;
    for (let i = 3; i < 12; i++) pass.push(getRandomChar(all));
    const generated = pass.sort(() => Math.random() - 0.5).join("");
    
    setUserData({ ...userData, password: generated });
    setShowPassword(true);
    toast.success("Password generated");
  };

  const [submitting, setSubmitting] = useState(false);

  const handleAddUser = async () => {
    if (!userData.email || !userData.firstName) {
      toast.error("Required: First Name and Email");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        job_title: userData.jobTitle,
        department: userData.department,
        role: userData.role,
        allowed_routes: allowedRoutes,
        assigned_companies: selectedCompanies.map((c) => c.value),
      };

      const res = await fetch(isEditMode ? `/api/user/get-users/${userId}` : "/api/user/add_user", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(isEditMode ? "User updated successfully!" : "User created successfully!");
        
        if (!isEditMode) {
          setUserData({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            role: "Social Media Analyst",
            jobTitle: "SDE",
            department: "",
          });
          setAllowedRoutes([]);
          setSelectedCompanies([]);
        } else {
          router.push("/admin/all_users");
        }
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Connection error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCompany = () => {
    if (!companyData.name) {
      toast.error("Company name is required");
      return;
    }
    toast.info(`Registering ${companyData.name}... (Integration pending)`);
  };

  const navigationCards = [
    { name: "View Users", href: "/admin/all_users", icon: Eye, color: "text-green-600", bg: "bg-green-50", description: "Manage existing user accounts and profiles" },
    { name: "View Companies", href: "/admin/companies", icon: Building, color: "text-indigo-600", bg: "bg-indigo-50", description: "Review and organize portfolio companies" },
    { name: "Admin Dashboard", href: "/admin", icon: LayoutGrid, color: "text-slate-600", bg: "bg-slate-50", description: "Return to the main administration panel" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 group flex items-center gap-2">
              {isEditMode ? <Edit className="h-6 w-6 text-amber-500" /> : <Zap className="h-6 w-6 text-blue-600 fill-blue-600" />}
              {isEditMode ? "Edit User Workspace" : "Quick Access Center"}
            </h1>
            <p className="text-slate-600">
              {isEditMode 
                ? `Updating profile and permissions for ${userData.firstName || 'user'}` 
                : "Central hub for user onboarding and portfolio management."
              }
            </p>
          </div>
          <Button variant="outline" className="text-slate-500" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Form
          </Button>
        </div>

        {/* TOP NAVIGATION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {navigationCards.map((card) => (
            <Link key={card.name} href={card.href} className="block group">
              <Card className="hover:shadow-md transition-all border-slate-200 group-hover:border-blue-200">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={clsx("p-3 rounded-xl", card.bg)}>
                    <card.icon className={clsx("h-5 w-5", card.color)} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{card.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{card.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* PRIMARY WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          {/* Main User Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-50 pb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Core User Profile</CardTitle>
                </div>
                <CardDescription>Enter basic details and system role for the user.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-slate-600">First Name</Label>
                    <Input 
                      placeholder="John" 
                      value={userData.firstName} 
                      onChange={(e) => setUserData({...userData, firstName: e.target.value})} 
                      className="bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-600">Last Name</Label>
                    <Input 
                      placeholder="Doe" 
                      value={userData.lastName} 
                      onChange={(e) => setUserData({...userData, lastName: e.target.value})} 
                      className="bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-600">Email Address</Label>
                  <Input 
                    type="email" 
                    placeholder="john@example.com" 
                    value={userData.email} 
                    onChange={(e) => setUserData({...userData, email: e.target.value})} 
                    className="bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-600">Password</Label>
                  <div className="flex gap-2">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={userData.password} 
                      onChange={(e) => setUserData({...userData, password: e.target.value})} 
                      className="font-mono bg-slate-50/50"
                    />
                    <Button variant="outline" type="button" size="icon" onClick={() => setShowPassword(!showPassword)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" type="button" className="text-xs" onClick={generatePassword}>
                      Auto
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-slate-600">Job Title</Label>
                    <Input 
                      value={userData.jobTitle} 
                      onChange={(e) => setUserData({...userData, jobTitle: e.target.value})} 
                      className="bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-600">Department</Label>
                    <Input 
                      placeholder="e.g. Sales" 
                      value={userData.department} 
                      onChange={(e) => setUserData({...userData, department: e.target.value})} 
                      className="bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-600">System Role</Label>
                  <ShadcnSelect value={userData.role} onValueChange={(v) => setUserData({...userData, role: v})}>
                    <SelectTrigger className="bg-slate-50/50">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Developer">Developer</SelectItem>
                      <SelectItem value="Social Media Analyst">Social Media Analyst</SelectItem>
                      <SelectItem value="Investor Relations Analyst">Investor Relations Analyst</SelectItem>
                    </SelectContent>
                  </ShadcnSelect>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="border-b border-slate-50 pb-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-slate-600" />
                  <CardTitle className="text-lg">Access Permissions</CardTitle>
                </div>
                <CardDescription>Select the application routes this user is allowed to access.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ALL_ROUTES.map((route) => {
                    const active = allowedRoutes.includes(route.path);
                    return (
                      <button
                        key={route.path}
                        onClick={() => toggleRoute(route.path)}
                        className={clsx(
                          "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                          active 
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                            : "bg-white border-slate-100 text-slate-600 hover:border-blue-200 shadow-sm"
                        )}
                      >
                        <route.icon className={clsx("h-4 w-4 shrink-0", active ? "text-white" : "text-blue-500")} />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold leading-none mb-0.5 truncate">{route.label}</p>
                          <p className={clsx("text-[9px] truncate opacity-80", active ? "text-blue-50" : "text-slate-400 font-mono")}>{route.path}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel: Assignments & Company Reg */}
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-lg">Portfolio Linkage</CardTitle>
                </div>
                <CardDescription>Directly assign companies to this account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                <ReactSelect
                  isMulti
                  options={companyOptions}
                  placeholder="Select companies..."
                  isLoading={loading}
                  value={selectedCompanies}
                  onChange={(selected) => setSelectedCompanies(selected || [])}
                  className="text-sm"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      borderColor: '#e2e8f0'
                    })
                  }}
                />
                
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Selected Portfolios</p>
                  <div className="max-h-60 overflow-y-auto space-y-2 rounded-lg p-1">
                    {selectedCompanies.map(c => (
                      <div key={c.value} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs group animate-in slide-in-from-right-2">
                        <span className="font-semibold text-slate-700 truncate">{c.label}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-slate-100" 
                          onClick={() => setSelectedCompanies(prev => prev.filter(x => x.value !== c.value))}
                        >
                          <Plus className="h-4 w-4 rotate-45" />
                        </Button>
                      </div>
                    ))}
                    {selectedCompanies.length === 0 && (
                      <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-xl">
                        <Building className="h-8 w-8 text-slate-100 mx-auto mb-2" />
                        <p className="text-[10px] text-slate-300 font-medium italic">Empty Selection</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 font-bold" 
                    onClick={handleAddUser}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                    ) : (
                      isEditMode ? <Edit className="h-5 w-5 mr-3" /> : <UserPlus className="h-5 w-5 mr-3" />
                    )}
                    {submitting ? "Processing..." : isEditMode ? "Save Profile Changes" : "Finalize Onboarding"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
               <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                       <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Need a new company?</h4>
                      <p className="text-[11px] text-slate-500 mt-1">Scroll down to the fast registration panel to index a new legal entity instantly.</p>
                    </div>
                  </div>
               </CardContent>
            </Card>
          </div>
        </div>

        {/* SECTION 2: COMPANY REGISTRATION (RESTORED STYLE) */}
        <section className="space-y-6 pt-10 border-t border-slate-100">
          <div className="flex items-center gap-2 px-1">
             <div className="p-1.5 bg-indigo-100 rounded-md">
                <Building className="h-5 w-5 text-indigo-600" />
             </div>
             <h2 className="text-xl font-bold text-slate-800 tracking-tight">2. Fast Company Registration</h2>
          </div>

          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2 col-span-1">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Legal Name *</Label>
                    <div className="relative">
                      <Input placeholder="Acme International" value={companyData.name} onChange={(e) => setCompanyData({...companyData, name: e.target.value})} className="pl-10 h-11 bg-slate-50/30" />
                      <Building className="h-4 w-4 text-slate-300 absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Industry Segment</Label>
                    <div className="relative">
                      <Input placeholder="Fintech / SaaS" value={companyData.industry} onChange={(e) => setCompanyData({...companyData, industry: e.target.value})} className="pl-10 h-11 bg-slate-50/30" />
                      <Tag className="h-4 w-4 text-slate-300 absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Official Domain</Label>
                    <div className="relative">
                      <Input placeholder="acme.com" value={companyData.domain} onChange={(e) => setCompanyData({...companyData, domain: e.target.value})} className="pl-10 h-11 bg-slate-50/30" />
                      <Globe className="h-4 w-4 text-slate-300 absolute left-3.5 top-3.5" />
                    </div>
                  </div>
               </div>
               
               <div className="mt-8 flex flex-col md:flex-row items-center justify-between p-6 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100">
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
                       <Zap className="h-6 w-6 text-white animate-pulse" />
                    </div>
                    <div>
                      <p className="font-bold">Automated Indexing</p>
                      <p className="text-xs text-indigo-100">This entity will be available for search and assignment immediately.</p>
                    </div>
                  </div>
                  <Button className="bg-white text-indigo-600 hover:bg-slate-50 h-12 px-10 font-black tracking-tighter" onClick={handleAddCompany}>
                    <Plus className="h-4 w-4 mr-2 stroke-[3px]" />
                    REGISTER COMPANY
                  </Button>
               </div>
            </CardContent>
          </Card>
        </section>

      </div>
      <Toaster position="top-right" richColors />
    </DashboardLayout>
  );
}
