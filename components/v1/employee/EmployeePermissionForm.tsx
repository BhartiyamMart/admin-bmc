"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { assignEmployeePermission, getEmployeePermission } from "@/apis/create-employeepermission.api";
import { getEmployee } from "@/apis/create-employee.api";

const EmployeePermissionForm = () => {
  const [form, setForm] = useState({
    employeeId: "",
    permissionId: "",
  });

  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [permissions, setPermissions] = useState<{ id: string; name: string }[]>([]);

  const [employeeFilter, setEmployeeFilter] = useState("");
  const [permissionFilter, setPermissionFilter] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getEmployee();
        if (!response.error && response.status === 200 && response.payload?.employees) {
          setEmployees(
            response.payload.employees.map((emp) => ({
              id: emp.id.toString(),
              name: `${emp.firstName} ${emp.lastName || ""}`.trim(),
            }))
          );
        } else {
          toast.error("Failed to load employees");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch employees");
      }
    };

    const fetchPermissions = async () => {
      try {
        const response = await getEmployeePermission();
        if (!response.error && response.status === 200 && response.payload?.permissions) {
          setPermissions(
            response.payload.allPermissions.map((perm) => ({
              id: perm.id.toString(),
              name: perm.name,
            }))
          );
        } else {
          toast.error("Failed to load permissions");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch permissions");
      }
    };

    fetchEmployees();
    fetchPermissions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.employeeId || !form.permissionId) {
      alert("Both employee and permission are required");
      return;
    }

    try {
      const response = await assignEmployeePermission({
        employeeId: form.employeeId,
        permissionId: form.permissionId,
      });

      if (!response.error && (response.status === 200 || response.status === 201)) {
        toast.success("Permission assigned successfully");
        router.push("/employee-management/emp-permissionlist");
      } else {
        toast.error(response.message || "Failed to assign permission");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while assigning permission");
    }
  };

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center bg-sidebar p-4">
      <div className="w-full overflow-y-auto rounded-lg p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Assign Employee Permission</p>
          <Link
            href="/employee-management/emp-permissionlist"
            className="flex cursor-pointer rounded px-3 py-2 text-sm bg-primary text-background transition"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link> 
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          {/* Employee */}
          <div className="space-y-2">
            <Label>Employee *</Label>
            <Select
              onValueChange={(value: string) => setForm({ ...form, employeeId: value })}
              value={form.employeeId}
              disabled={employees.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={employees.length ? "Select employee" : "Loading employees..."} />
              </SelectTrigger>
              <SelectContent>
                {/* Search input */}
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search employee..."
                    value={employeeFilter}
                    onChange={(e) => setEmployeeFilter(e.target.value)}
                    className="w-full border rounded p-1 text-sm mb-2"
                  />
                </div>
                {employees
                  .filter((emp) =>
                    emp.name.toLowerCase().includes(employeeFilter.toLowerCase())
                  )
                  .map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Permission */}
          <div className="space-y-2">
            <Label>Permission *</Label>
            <Select
              onValueChange={(value: string) => setForm({ ...form, permissionId: value })}
              value={form.permissionId}
              disabled={permissions.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={permissions.length ? "Select permission" : "Loading permissions..."} />
              </SelectTrigger>
              <SelectContent>
                {/* Search input */}
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search permission..."
                    value={permissionFilter}
                    onChange={(e) => setPermissionFilter(e.target.value)}
                    className="w-full border rounded p-1 text-sm mb-2"
                  />
                </div>
                {permissions
                  .filter((perm) =>
                    perm.name.toLowerCase().includes(permissionFilter.toLowerCase())
                  )
                  .map((perm) => (
                    <SelectItem key={perm.id} value={perm.id}>
                      {perm.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="mt-5 w-full rounded-sm bg-orange-400 px-20 py-2 text-white transition hover:bg-orange-500"
            disabled={!form.employeeId || !form.permissionId}
          >
            Save
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EmployeePermissionForm;
