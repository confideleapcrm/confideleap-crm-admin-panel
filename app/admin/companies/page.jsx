"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import React, { useEffect, useMemo, useState } from "react";
import { Edit, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CompanyTransferModal from "@/components/dashboards/CompanyTransferModal";
import { Toaster, toast } from "sonner";

const page = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const filteredCompanies = useMemo(() => {
    if (!search) return companies;

    return companies.filter((company) => {
      const name = (company.name ?? "").toLowerCase();
      const industry = (company.industry ?? "").toLowerCase();
      const query = search.toLowerCase();

      return name.includes(query) || industry.includes(query);
    });
  }, [search, companies]);

  const getCompanies = async () => {
    try {
      const res = await fetch(`/api/companies/get-companies`);

      if (!res.ok) {
        throw new Error("Failed to fetch companies");
      }
      const data = await res.json();
      console.log(data);
      setCompanies(data.companies);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/companies/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Company deleted successfully");
        getCompanies();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete company");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting the company");
    }
  };

  useEffect(() => {
    getCompanies();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-slate-600">Loading companies...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-3">
        <div className="flex flex-col md:flex-row items-center md:gap-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            All Companies
          </h2>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-64">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
        <table className="min-w-full table-fixed divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                No.
              </th>

              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Company Name
              </th>

              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Industry
              </th>

              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Domain
              </th>

              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Assigned User
              </th>

              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>

              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-slate-200">
            {filteredCompanies?.map((company, index) => (
              <tr
                key={company.id}
                className="hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={() => {
                  const query = new URLSearchParams();
                  if (company.assigned_user_id) query.set("id", company.assigned_user_id);
                  query.set("company_id", company.id);
                  router.push(`/admin/quick_access?${query.toString()}`);
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">
                  {company.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {company.industry || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {company.domain || "N/A"}
                </td>

                <td className="px-6 py-4 text-sm text-gray-700">
                  {company.first_name
                    ? `${company.first_name} ${company.last_name}`
                    : "Not Assigned"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      company.company_status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {company.company_status || "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                  <Link
                    href={{
                      pathname: "/admin/quick_access",
                      query: { id: company.assigned_user_id },
                    }}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center space-x-1 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit User</span>
                  </Link>

                  {company.company_status === "Active" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCompany(company);
                        setIsTransferModalOpen(true);
                      }}
                      className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 flex items-center space-x-1 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Transfer</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(company.id, company.name);
                    }}
                    className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 flex items-center space-x-1 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </td>

                {/* <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      company.assignment_status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {company.assignment_status || "N/A"}
                  </span>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCompanies?.length === 0 && (
          <div className="p-10 text-center text-gray-500 bg-white">
            <div className="text-4xl mb-2">🏢</div>
            <p className="text-lg font-medium">No companies found.</p>
            <p className="text-sm">
              Try adjusting your search or add a new company.
            </p>
          </div>
        )}
      </div>
      <CompanyTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        company={selectedCompany}
        onTransferSuccess={getCompanies}
      />
      <Toaster position="top-right" />
    </DashboardLayout>
  );
};

export default page;
