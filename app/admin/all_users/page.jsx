"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import React, { useEffect, useMemo, useState } from "react";
import { Edit } from "lucide-react";
import Link from "next/link";

const page = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const filteredUsers = useMemo(() => {
    if (!search) return users;

    return users.filter((user) => {
      const fullName =
        `${user.first_name ?? ""} ${user.last_name ?? ""}`.toLowerCase();
      const email = (user.email ?? "").toLowerCase();
      const role = (user.role ?? "").toLowerCase(); // <-- default to empty string
      const query = search.toLowerCase();

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        role.includes(query)
      );
    });
  }, [search, users]);

  const getUsers = async () => {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
      }).toString();

      const res = await fetch(`/api/user/get-users?${query}`);

      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await res.json();
      console.log(data);
      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, [page, search]);

  if (loading) {
    return <p>Loading...</p>;
  }
  return (
    <DashboardLayout>
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-3">
        <div className="flex flex-col md:flex-row items-center md:gap-4">
          <h2 className="text-2xl font-semibold text-slate-900">All Users</h2>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-64">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                No.
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Edit
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-slate-200">
            {filteredUsers?.map((user, index) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                  {user.first_name} {user.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-700"
                        : user.role === "developer"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    href={{
                      pathname: "/admin/add_user",
                      query: { id: user.id },
                    }}
                    className="px-3 py-1 text-sm text-blue-500 hover:text-blue-600 flex items-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between mt-3 px-3 pb-3">
          <p className="text-sm text-gray-500">
            Page {page} of {Math.ceil(total / limit)}
          </p>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>

            <button
              disabled={page * limit >= total}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {filteredUsers?.length === 0 && (
          <div className="p-6 text-center text-gray-500">No users found.</div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default page;
