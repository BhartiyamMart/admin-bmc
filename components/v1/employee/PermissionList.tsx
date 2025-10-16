"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Plus, FilePenLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommonTable from "@/components/v1/common/common-table/common-table";
import usePermissionStore, { Permission } from "@/store/permissionStore";
import { getEmployeePermission } from "@/apis/create-employeepermission.api";

const PermissionList = () => {
  const permissions = usePermissionStore((state) => state.permissions);
  const setPermissions = usePermissionStore((state) => state.setPermissions);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  //Fetch all permissions dynamically
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const roleId = ""; // Leave empty or provide roleId if needed
        const resp = await getEmployeePermission(roleId);

        if (!resp.error && resp.payload?.allPermissions) {
          // Map API response for table
          const perms: Permission[] = resp.payload.allPermissions.map((p) => ({
            id:p.id,
            name: p.name,
            description: p.description,
            status: true, // Default true if no status provided
            createdAt: p.createdAt ? new Date(p.createdAt).toLocaleString() : "-",
          }));
          setPermissions(perms);
        } else {
          setPermissions([]);
        }
      } catch (err) {
        console.error("Failed to fetch permissions:", err);
        setPermissions([]);
      }
    };

    fetchPermissions();
  }, [setPermissions]);

  // 🔍 Filter + Search logic
  const filteredPermissions = useMemo(() => {
    return permissions.filter((perm) => {
      const matchesSearch =
        perm.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perm.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? perm.status === true
          : perm.status === false;

      return matchesSearch && matchesStatus;
    });
  }, [permissions, searchTerm, statusFilter]);

  // 📊 Pagination logic
  const totalPages = Math.ceil(filteredPermissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPermissions = filteredPermissions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // 🧭 Pagination controls
  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  // ✅ Table Columns (Removed id and updatedAt)
  const columns = [
    {
      key: "sno",
      label: "S.No",
      render: (_: any, index: any) => startIndex + index + 1,
    },
    { key: "name", label: "Name" },
    {
      key: "description",
      label: "Description",
      render: (perm: any) => (
        <span className="max-w-[300px] break-words">{perm.description || "-"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (perm: any) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            perm.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {perm.status ? "Active" : "Inactive"}
        </span>
      ),
    },
    { key: "createdAt", label: "Created At" },
    {
      key: "actions",
      label: "Actions",
      render: (perm: any) => (
        <div className="flex justify-end gap-2 pr-4">
          <FilePenLine className="cursor-pointer w-5 text-primary" />
          <Trash2 className="cursor-pointer w-5 text-primary" />
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="w-full rounded-lg bg-sidebar p-4 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-md font-semibold">Permissions</p>
          <Link href="/employee-management/permission-add">
            <Button className="flex rounded-sm p-2 pr-3 pl-3 text-sm bg-primary text-background">
              <Plus className="mr-2 h-5 w-5" /> Add Permission
            </Button>
          </Link>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-1/5 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-1/6 rounded-md border bg-sidebar border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Common Table */}
        <CommonTable
          columns={columns}
          data={currentPermissions}
          emptyMessage="No permissions found."
        />

        {/* Pagination */}
        {filteredPermissions.length > 0 && (
          <div className="mt-4 flex w-[30%] float-end justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`rounded-md border px-3 py-1 ${
                currentPage === 1 ? "cursor-not-allowed opacity-50" : "hover:bg-primary hover:text-white"
              }`}
            >
              Previous
            </button>
            <span className="font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`rounded-md border px-3 py-1 ${
                currentPage === totalPages ? "cursor-not-allowed opacity-50" : "hover:bg-primary hover:text-white"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionList;
