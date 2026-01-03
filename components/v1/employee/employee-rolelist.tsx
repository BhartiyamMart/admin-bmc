'use client';

import { useEffect, useState } from 'react';
import { FilePenLine, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import CommonTable from '@/components/v1/common/common-table/common-table';

//  Import APIs
import { getEmployeeRole, deleteEmployeeRole } from '@/apis/employee-role.api'; // adjust path as needed

interface Role {
  id: string;
  name: string;
  description?: string;
  status: boolean;
  createdAt: string;
}

const EmployeeRoleList = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    roleId: string | null;
    roleName: string;
  }>({ open: false, roleId: null, roleName: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const router = useRouter();

  //  Fetch employee roles from API
  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await getEmployeeRole();
      if (response?.payload?.roles && Array.isArray(response.payload.roles)) {
        const formattedRoles = response.payload.roles.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.hierarchyOrder?.toString() || '—',
          status: r.status,
          createdAt: '-', // placeholder since API doesn’t return createdAt
        }));
        setRoles(formattedRoles);
      } else {
        toast.error('Failed to load roles from server');
        setRoles([]);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Something went wrong while fetching roles');
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  //  Handle edit
  const handleEditRole = (roleId: string) => {
    router.push(`/employee-management/employee-role?id=${roleId}`);
  };

  //  Confirm delete
  const handleDeleteConfirmation = (roleId: string, roleName: string) => {
    setDeleteDialog({ open: true, roleId, roleName });
  };

  //  Delete API Integration
  const handleDeleteRole = async () => {
    if (!deleteDialog.roleId) return;
    setDeletingId(deleteDialog.roleId);

    try {
      const response = await deleteEmployeeRole({ id: deleteDialog.roleId });

      if (response && response.status === 200 && !response.error) {
        toast.success('Role Inactive successfully!');
        setDeleteDialog({ open: false, roleId: null, roleName: '' });

        //  Re-fetch roles after successful delete
        await fetchRoles();
      } else {
        toast.error(response?.message || 'Failed to delete role');
      }
    } catch (error) {
      console.error('Delete role error:', error);
      toast.error('Something went wrong while deleting role');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtering + Pagination
  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'active' ? role.status === true : role.status === false;
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
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#f07d02]" />
      </div>
    );
  }

  const columns = [
    {
      key: 'sno',
      label: 'S.No.',
      render: (_: Role, index: number) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    { key: 'name', label: 'Role Name' },
    {
      key: 'description',
      label: 'Description',
      render: (role: Role) => <span className="text-foreground text-sm">{role.description || '—'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (role: Role) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            role.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {role.status ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (role: Role) => <span className="text-foreground text-center text-sm">{role.createdAt || '-'}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (role: Role) => (
        <div className="flex justify-end">
          {/*  Edit Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 cursor-pointer p-0 hover:bg-blue-50"
            onClick={() => handleEditRole(role.id)}
            title="Edit Role"
          >
            <FilePenLine className="text-primary h-5 w-5" />
          </Button>

          {/* Delete Button (disabled if inactive) */}
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 cursor-pointer p-0 ${
              role.status ? 'hover:bg-red-50' : 'cursor-not-allowed opacity-50'
            }`}
            onClick={() => role.status && handleDeleteConfirmation(role.id, role.name)}
            disabled={!role.status || deletingId === role.id}
            title={!role.status ? 'Inactive roles cannot be deleted' : 'Delete Role'}
          >
            {deletingId === role.id ? (
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-red-600" />
            ) : (
              <Trash2 className={`h-4 w-4 cursor-pointer ${role.status ? 'text-primary' : 'text-primary'}`} />
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="foreground flex justify-center p-4">
      <div className="bg-sidebar w-full rounded p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between">
          <p className="text-md font-semibold">Employee Roles</p>
          <Link
            href="/employee-management/employee-role"
            className="bg-primary text-background flex rounded p-2 pr-3 pl-3 text-sm"
          >
            <Plus className="mr-2 h-5 w-5" /> Add Role
          </Link>
        </div>

        {/* Search + Filter */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-1/3">
            <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border py-2 pr-10 pl-3 text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="bg-sidebar w-full cursor-pointer rounded border px-3 py-2 text-sm sm:w-1/2 md:w-1/3 lg:w-1/5 xl:w-1/6"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="w-full min-w-full sm:w-[560px] md:w-[640px] lg:w-[900px] xl:w-[1100px]">
          {/* Common Table */}
          <CommonTable columns={columns} data={currentRoles} emptyMessage="No roles found." />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="float-end mt-4 flex items-center justify-between">
              <Button
                className="cursor-pointer"
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`cursor-pointer rounded px-3 py-1 text-sm ${
                      page === currentPage ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <Button
                className="cursor-pointer"
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Delete Dialog */}
        <AlertDialog
          open={deleteDialog.open}
          onOpenChange={(open) => !open && setDeleteDialog({ open: false, roleId: null, roleName: '' })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Role</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{' '}
                <span className="font-semibold">&quot;{deleteDialog.roleName}&quot;</span>? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={!!deletingId}
                onClick={() => setDeleteDialog({ open: false, roleId: null, roleName: '' })}
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
                    <div className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
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
