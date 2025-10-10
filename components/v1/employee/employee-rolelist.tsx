"use client";

import React, { useEffect, useState } from "react";
import { FilePenLine, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CommonTable from "@/components/v1/common/common-table/common-table";

interface Role {
  id: string;
  name: string;
  status: boolean;
  createdAt: string;
}

const LOCAL_STORAGE_KEY = "employeeRoles";

const EmployeeRoleList = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all"
  );
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    roleId: string | null;
    roleName: string;
  }>({ open: false, roleId: null, roleName: "" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const router = useRouter();

  // Load roles from localStorage on mount
  useEffect(() => {
    setIsLoading(true);
    try {
      const storedRoles = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedRoles) {
        setRoles(JSON.parse(storedRoles));
      } else {
        setRoles([]); // no data, empty list
      }
    } catch (error) {
      toast.error("Failed to load roles from local storage");
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save roles to localStorage whenever roles change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(roles));
  }, [roles]);

  // Handlers
  const handleEditRole = (roleId: string) => {
    router.push(`/employee-management/employee-role?id=${roleId}`);
  };

  const handleDeleteConfirmation = (roleId: string, roleName: string) => {
    setDeleteDialog({ open: true, roleId, roleName });
  };

  const handleDeleteRole = async () => {
    if (!deleteDialog.roleId) return;
    setDeletingId(deleteDialog.roleId);

    try {
      // Remove from roles state
      setRoles((prev) => prev.filter((role) => role.id !== deleteDialog.roleId));
      toast.success("Role deleted successfully!");
      setDeleteDialog({ open: false, roleId: null, roleName: "" });
    } catch {
      toast.error("Failed to delete role");
    } finally {
      setDeletingId(null);
    }
  };

  // Filtering + Pagination
  const filteredRoles = roles.filter((role) => {
    const matchesSearch = role.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? role.status === true
        : role.status === false;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRoles = filteredRoles.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#f07d02]" />
      </div>
    );
  }

  // Table columns
  const columns = [
    {
      key: "sno",
      label: "S. No.",
      render: (_: Role, index: number) =>
        (currentPage - 1) * itemsPerPage + index + 1,
    },
    { key: "name", label: "Role Name" },
    {
      key: "status",
      label: "Status",
      render: (role: Role) => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
            role.status
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {role.status ? "Active" : "Inactive"}
        </span>
      ),
    },
    { key: "createdAt", label: "Created At" },
    {
      key: "actions",
      label: "Actions",
      render: (role: Role) => (
        <div className="flex justify-end gap-2 pr-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-blue-50"
            onClick={() => handleEditRole(role.id)}
            title="Edit Role"
          >
            <FilePenLine className="w-4 h-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-50"
            onClick={() => handleDeleteConfirmation(role.id, role.name)}
            disabled={deletingId === role.id}
            title="Delete Role"
          >
            {deletingId === role.id ? (
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-red-600" />
            ) : (
              <Trash2 className="w-4 h-4 text-red-600" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen  flex justify-center p-4">
      <div className="w-full max-h-[89vh] overflow-y-auto bg-sidebar shadow-lg rounded-lg p-4">
        {/* Header */}
        <div className="w-full mb-4 flex justify-between items-center">
          <p className="text-md font-semibold">Employee Role List</p>
          <Link
            href="/employee-management/employee-role"
            className="flex bg-primary text-background rounded-sm p-2 pr-3 pl-3 text-sm"
          >
            <Plus className="mr-2 h-5 w-5" /> Add Role
          </Link>
        </div>

        {/* Search + Filter */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search by role name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-1/3 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as "all" | "active" | "inactive");
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
          data={currentRoles}
          emptyMessage="No roles found."
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex w-[30%] float-end justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      page === currentPage
                        ? "bg-primary text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Delete Dialog */}
        <AlertDialog
          open={deleteDialog.open}
          onOpenChange={(open) =>
            !open &&
            setDeleteDialog({ open: false, roleId: null, roleName: "" })
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Role</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">"{deleteDialog.roleName}"</span>?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={!!deletingId}
                onClick={() =>
                  setDeleteDialog({ open: false, roleId: null, roleName: "" })
                }
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteRole}
                disabled={!!deletingId}
                className="bg-red-600 hover:bg-red-700"
              >
                {deletingId ? (
                  <>
                    <div className="animate-spin rounded-full border-b-2 border-white h-4 w-4 mr-2 inline-block" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default EmployeeRoleList;
