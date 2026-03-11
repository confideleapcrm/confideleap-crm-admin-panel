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
  ArrowRight,
  Shield,
  Zap,
  Briefcase,
  Mail,
  Lock,
  RefreshCw,
  Globe,
  Tag,
  UserPlus,
  LayoutGrid,
  Eye,
  Target,
  BarChart3,
  Upload,
  Settings,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import Link from "next/link";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";

export default function QuickAccessPage() {
  // User Form State - Full fields from add_user
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
      // Clear pending once matched
      setPendingAssignments([]);
    }
  }, [pendingAssignments, availableCompanies]);

  useEffect(() => {
    if (!userId || userId === 'null') {
      // Reset if no ID or 'null' string
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
      // If we clicked a company that has no user, pre-select that company for the NEW user
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
        
        // Store IDs to be matched later
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
    toast.success("Robust password generated");
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
        toast.success(isEditMode ? `User ${userData.firstName} successfully updated!` : `User ${userData.firstName} successfully created and onboarded!`);
        
        if (!isEditMode) {
          // Reset form only if creating
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
          // If editing, maybe redirect or just stay
          router.push("/admin/all_users");
        }
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Connection error. Could not reach server.");
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

  const navigationShortcuts = [
    { name: "Add User", href: "/admin/add_user", icon: UserPlus, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "View Users", href: "/admin/all_users", icon: Eye, color: "text-green-600", bg: "bg-green-50" },
    { name: "View Companies", href: "/admin/companies", icon: Building, color: "text-indigo-600", bg: "bg-indigo-50" },
    { name: "Admin Dashboard", href: "/admin", icon: LayoutGrid, color: "text-slate-600", bg: "bg-slate-50" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-10 pb-20">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-amber-100 rounded-md">
                <Zap className="h-5 w-5 text-amber-600 fill-amber-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Quick Action Center</h1>
            </div>
            <p className="text-slate-500">
               Unified terminal for user permissions, portfolio assignment, and company registration.
            </p>
          </div>
          <Button variant="ghost" className="text-slate-500 hover:text-blue-600" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Inputs
          </Button>
        </div>

        {/* NAVIGATION SHORTCUTS */}
        {!isEditMode && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1 text-slate-400">
               <LayoutGrid className="h-4 w-4" />
               <span className="text-xs font-bold uppercase tracking-widest">Global Sections</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {navigationShortcuts.map((item) => (
                <Link key={item.name} href={item.href}>
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:shadow-lg hover:border-blue-400 transition-all flex flex-col items-center gap-2 cursor-pointer group">
                    <div className={`p-2.5 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">{item.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 1: DETAILED USER ONBOARDING */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-1">
             <UserPlus className={clsx("h-5 w-5", isEditMode ? "text-amber-600" : "text-blue-600")} />
             <h2 className="text-xl font-bold text-slate-800 tracking-tight">
               {isEditMode ? `Edit User: ${userData.firstName} ${userData.lastName}` : "1. Detailed User Onboarding"}
             </h2>
          </div>
          
          <Card className="border-slate-200 shadow-xl ring-1 ring-slate-200/50 overflow-hidden bg-white">
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              {/* PRIMARY DETAILS */}
              <div className="md:col-span-8 p-8 space-y-8">
                
                {/* Identification */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest border-b pb-1">Basic Identity</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">First Name</Label>
                      <Input placeholder="John" value={userData.firstName} onChange={(e) => setUserData({...userData, firstName: e.target.value})} className="bg-slate-50/50 focus:bg-white border-slate-200" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Last Name</Label>
                      <Input placeholder="Doe" value={userData.lastName} onChange={(e) => setUserData({...userData, lastName: e.target.value})} className="bg-slate-50/50 focus:bg-white border-slate-200" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Email Address</Label>
                      <Input type="email" placeholder="john@company.com" value={userData.email} onChange={(e) => setUserData({...userData, email: e.target.value})} className="bg-slate-50/50" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Credentials</Label>
                      <div className="flex gap-2">
                        <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            value={userData.password} 
                            onChange={(e) => setUserData({...userData, password: e.target.value})} 
                            className="bg-slate-50/50 font-mono text-sm" 
                        />
                        <Button variant="outline" size="icon" className="shrink-0" onClick={() => setShowPassword(!showPassword)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="secondary" className="shrink-0 text-xs" onClick={generatePassword}>Auto</Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Info */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest border-b pb-1">Professional Profile</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Job Title</Label>
                      <Input value={userData.jobTitle} onChange={(e) => setUserData({...userData, jobTitle: e.target.value})} className="bg-slate-50/50" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Department</Label>
                      <Input placeholder="e.g. Sales" value={userData.department} onChange={(e) => setUserData({...userData, department: e.target.value})} className="bg-slate-50/50" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">System Role</Label>
                      <ShadcnSelect value={userData.role} onValueChange={(v) => setUserData({...userData, role: v})}>
                        <SelectTrigger className="bg-slate-50/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Developer">Developer</SelectItem>
                          <SelectItem value="Social Media Analyst">Social Media Analyst</SelectItem>
                          <SelectItem value="Investor Relations Analyst">Investor Relations Analyst</SelectItem>
                        </SelectContent>
                      </ShadcnSelect>
                    </div>
                  </div>
                </div>

                {/* Permissions Grid */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest border-b pb-1">Allowed Access Routes</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {ALL_ROUTES.map((route) => {
                      const active = allowedRoutes.includes(route.path);
                      return (
                        <button
                          key={route.path}
                          onClick={() => toggleRoute(route.path)}
                          className={clsx(
                            "group flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                            active 
                              ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100 scale-[1.02]" 
                              : "bg-white border-slate-100 hover:border-blue-200 text-slate-600"
                          )}
                        >
                          <route.icon className={clsx("h-4 w-4 shrink-0", active ? "text-white" : "text-blue-500 group-hover:scale-110 transition-transform")} />
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold leading-none mb-0.5 truncate">{route.label}</p>
                            <p className={clsx("text-[9px] truncate opacity-60", active ? "text-blue-50" : "text-slate-400")}>{route.path}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* QUICK ASSIGNMENT PANEL */}
              <div className="md:col-span-4 p-8 bg-slate-50/30 flex flex-col h-full overflow-hidden">
                <div className="flex-1 space-y-6">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <Label className="text-xs font-black uppercase text-slate-500 tracking-widest block mb-4">Portfolio Linkage</Label>
                    <ReactSelect
                      isMulti
                      options={companyOptions}
                      placeholder="Search company..."
                      className="text-sm"
                      isLoading={loading}
                      onChange={(selected) => setSelectedCompanies(selected || [])}
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderRadius: '12px',
                          border: '1px solid #f1f5f9',
                          backgroundColor: '#f8fafc',
                          boxShadow: 'none',
                          minHeight: '44px'
                        }),
                        multiValue: (base) => ({
                          ...base,
                          backgroundColor: '#3b82f6',
                          borderRadius: '6px',
                          padding: '0 4px'
                        }),
                        multiValueLabel: (base) => ({
                          ...base,
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: '700'
                        }),
                        multiValueRemove: (base) => ({
                          ...base,
                          color: '#ffffff',
                          cursor: 'pointer',
                          '&:hover': { background: 'transparent', color: '#ff4444' }
                        })
                      }}
                    />
                    
                    <div className="mt-6 space-y-3">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isEditMode ? "Active Assignments" : "Current Selection"}</p>
                       <div className="max-h-[220px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                          {selectedCompanies.map(c => (
                            <div key={c.value} className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-lg group animate-in slide-in-from-right-2 duration-200">
                               <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-md bg-blue-50 flex items-center justify-center text-[10px] font-black text-blue-400">
                                    {c.label[0]}
                                  </div>
                                  <span className="text-xs font-semibold text-slate-600 truncate max-w-[120px]">{c.label}</span>
                               </div>
                               <button 
                                 onClick={() => setSelectedCompanies(prev => prev.filter(x => x.value !== c.value))}
                                 className={clsx(
                                   "transition-all",
                                   isEditMode 
                                     ? "text-[9px] font-bold uppercase text-red-400 hover:text-red-600 px-2 py-1 bg-red-50 rounded" 
                                     : "text-slate-300 hover:text-red-500"
                                 )}
                               >
                                 {isEditMode ? "Deactivate" : <Plus className="h-4 w-4 rotate-45" />}
                               </button>
                            </div>
                          ))}
                          {selectedCompanies.length === 0 && (
                            <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-xl">
                               <Building className="h-8 w-8 text-slate-100 mx-auto mb-2" />
                               <p className="text-[10px] text-slate-300 font-medium">No companies linked</p>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                   <Button 
                      className="w-full h-14 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 group relative overflow-hidden" 
                      onClick={handleAddUser}
                      disabled={submitting}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform"></div>
                      {submitting ? (
                        <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                      ) : isEditMode ? (
                        <Edit className="h-5 w-5 mr-3" />
                      ) : (
                        <UserPlus className="h-5 w-5 mr-3" />
                      )}
                      <span className="font-bold">{submitting ? "Processing..." : isEditMode ? "Save Changes" : "Finalize User Creation"}</span>
                   </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* SECTION 2: SIMPLIFIED COMPANY REGISTRATION */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-1">
             <Building className="h-5 w-5 text-indigo-600" />
             <h2 className="text-xl font-bold text-slate-800 tracking-tight">2. Fast Company Registration</h2>
          </div>

          <Card className="border-slate-200 shadow-md bg-white overflow-hidden">
            <CardContent className="p-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2 col-span-1">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Legal Name *</Label>
                    <div className="relative">
                      <Input placeholder="Acme International" value={companyData.name} onChange={(e) => setCompanyData({...companyData, name: e.target.value})} className="pl-10 h-11" />
                      <Building className="h-4 w-4 text-slate-300 absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Industry Segment</Label>
                    <div className="relative">
                      <Input placeholder="Fintech / SaaS" value={companyData.industry} onChange={(e) => setCompanyData({...companyData, industry: e.target.value})} className="pl-10 h-11" />
                      <Tag className="h-4 w-4 text-slate-300 absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Official Domain</Label>
                    <div className="relative">
                      <Input placeholder="acme.com" value={companyData.domain} onChange={(e) => setCompanyData({...companyData, domain: e.target.value})} className="pl-10 h-11" />
                      <Globe className="h-4 w-4 text-slate-300 absolute left-3.5 top-3.5" />
                    </div>
                  </div>
               </div>
               <div className="mt-8 flex flex-col md:flex-row items-center justify-between p-5 bg-indigo-600 rounded-2xl text-white">
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                       <Zap className="h-6 w-6 text-white animate-pulse" />
                    </div>
                    <div>
                      <p className="font-bold">Automated Setup</p>
                      <p className="text-xs text-indigo-100">Company will be indexed and available for assignment instantly.</p>
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
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </DashboardLayout>
  );
}
