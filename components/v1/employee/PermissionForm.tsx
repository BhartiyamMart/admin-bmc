"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import usePermissionStore from "@/store/permissionStore";
import {
  createEmployeePermission,
  updateEmployeePermission,
} from "@/apis/create-employeepermission.api";

const PermissionForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const permissions = usePermissionStore((state) => state.permissions);

  const [form, setForm] = useState({
    name: "",
    description: "",
    status: true,
  });

  useEffect(() => {
    if (id) {
      const perm = permissions.find((p) => p.id === id);
      if (perm) {
        setForm({
          name: perm.name,
          description: perm.description || "",
          status: perm.status ?? true,
        });
      } else {
        toast.error("Permission not found");
        router.push("/employee-management/permission-list");
      }
    }
  }, [id, permissions, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Name is required");
      return;
    }

    try {
      if (id) {
        // Edit mode
        const response = await updateEmployeePermission({
          id: id,
          name: form.name.trim(),
          description: form.description.trim(),
        });

        if (!response.error && response.status === 200) {
          toast.success("Permission updated successfully!");
          router.push("/employee-management/permission-list");
        } else {
          toast.error(response.message || "Failed to update permission.");
        }
      } else {
        // Add mode
        const response = await createEmployeePermission({
          name: form.name.trim(),
          description: form.description.trim(),
          status: form.status,
        });

        if (!response.error && response.status === 201) {
          toast.success("Permission created successfully!");
          router.push("/employee-management/permission-list");
        } else {
          toast.error(response.message || "Failed to create permission.");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving permission.");
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-sidebar p-4">
      <div className="w-full rounded-lg p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">
            {id ? "Edit Permission" : "Add Permission"}
          </p>
          <Link
            href="/employee-management/permission-list"
            className="flex cursor-pointer rounded bg-primary text-background px-3 py-2 text-sm">
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Enter permission name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Status */}
          

          {/* Submit */}
          <Button
            type="submit"
            className="mt-5 w-full rounded-sm bg-primary text-background px-20 py-2 transition"
          >
            {id ? "Update" : "Save"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PermissionForm;
