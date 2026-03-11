"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Select from "react-select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const CompanyTransferModal = ({ isOpen, onClose, company, onTransferSuccess }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);

  // Fetch users to transfer to
  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          const res = await fetch("/api/user/get-users?limit=100");
          if (!res.ok) throw new Error("Failed to fetch users");
          const data = await res.json();
          const userOptions = data.users.map((user) => ({
            value: user.id,
            label: `${user.first_name} ${user.last_name} (${user.email})`,
          }));
          setUsers(userOptions);
        } catch (error) {
          console.error("Error fetching users:", error);
          toast.error("Could not load users list");
        } finally {
          setUsersLoading(false);
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  const handleTransfer = async () => {
    if (!selectedUser) {
      toast.error("Please select a new owner");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/companies/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: company.id,
          newUserId: selectedUser.value,
          // We assume 'admin' ID might be needed but let's just use it if available.
          // In a real app, this would come from the session.
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Ownership transferred successfully");
        onTransferSuccess();
        onClose();
      } else {
        toast.error(data.message || "Transfer failed");
      }
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error("An error occurred during transfer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Ownership</DialogTitle>
          <DialogDescription>
            Transfer ownership of <strong>{company?.name}</strong> to another user.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">New Owner</label>
            <Select
              isLoading={usersLoading}
              options={users}
              onChange={setSelectedUser}
              placeholder="Select a user..."
              className="text-sm"
              isSearchable
            />
            {company?.first_name && (
              <p className="text-xs text-slate-500 italic">
                Current Owner: {company.first_name} {company.last_name}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleTransfer} disabled={loading || !selectedUser}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : (
              "Confirm Transfer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyTransferModal;
