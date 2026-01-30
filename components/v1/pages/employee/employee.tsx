'use client';

import Link from 'next/link';
import { ChevronDown, Eye, Plus, Search, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import React, { useEffect, useState } from 'react';
import CommonTable from '@/components/common/common-table/common-table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { getAllUsers, activateUser, deactivateUser, deleteCustomer, deleteUserReasons } from '@/apis/user.api';
import { IUserListData } from '@/interface/user.interface';
import ToggleStatusDialog from '@/components/common/popup/toggle-status';
// import ToggleStatusDialog from '@/components/v1/common/toggle-status-dialog';

const Employee = () => {
  const [employees, setEmployees] = useState<IUserListData[]>([]);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  // Delete Dialog State
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    employeeId: null as string | null,
    employeeName: null as string | null,
    employeePhone: '' as string,
  });

  // Delete Reasons State
  const [deleteReasons, setDeleteReasons] = useState<string[]>([]);
  const [loadingReasons, setLoadingReasons] = useState(false);
  const [selectedDeleteTitle, setSelectedDeleteTitle] = useState('');
  const [deleteReasonInput, setDeleteReasonInput] = useState('');

  // Permanent Delete State
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);

  // Toggle Status Dialog State
  const [toggleDialog, setToggleDialog] = useState({
    open: false,
    employeeId: null as string | null,
    employeeName: null as string | null,
    currentStatus: false,
  });

  // Loading States
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Fetch Employees
  const fetchEmployees = async () => {
    try {
      const response = await getAllUsers('employee', 1, 50, true);

      if (!response.error) {
        setEmployees(response.payload.users);
      } else {
        toast.error(response.message || 'Failed to fetch employees');
      }
    } catch (error) {
      console.error('Failed to fetch employee data:', error);
      toast.error('Failed to fetch employee data');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch Delete Reasons
  const fetchDeleteReasons = async () => {
    setLoadingReasons(true);
    try {
      const res = await deleteUserReasons('employee');
      if (res.status === 200 && res.payload) {
        setDeleteReasons(res.payload);
      } else {
        toast.error('Failed to load delete reasons');
        setDeleteReasons([]);
      }
    } catch (error) {
      console.error('Error fetching delete reasons:', error);
      toast.error('Failed to load delete reasons');
      setDeleteReasons([]);
    } finally {
      setLoadingReasons(false);
    }
  };

  // Open Delete Dialog
  const openDeleteDialog = async (employeeId: string, employeeName: string | null, employeePhone: string) => {
    setDeleteDialog({
      open: true,
      employeeId,
      employeeName,
      employeePhone,
    });

    // Reset form fields
    setSelectedDeleteTitle('');
    setDeleteReasonInput('');
    setIsPermanentDelete(false);

    // Fetch delete reasons
    await fetchDeleteReasons();
  };

  // Handle Delete Employee
  const handleDeleteEmployee = async () => {
    if (!deleteDialog.employeeId) return;

    // Validation
    if (!selectedDeleteTitle) {
      toast.error('Please select a delete reason');
      return;
    }

    if (!deleteReasonInput.trim()) {
      toast.error('Please provide additional details');
      return;
    }

    setDeletingId(deleteDialog.employeeId);

    try {
      const res = await deleteCustomer(deleteDialog.employeeId, {
        deleteTitle: selectedDeleteTitle,
        deleteReason: deleteReasonInput.trim(),
        permanentDelete: isPermanentDelete,
      });

      if (!res?.error) {
        toast.success(res.message || 'Employee deleted successfully');
        setDeleteDialog({
          open: false,
          employeeId: null,
          employeeName: null,
          employeePhone: '',
        });
        setEmployees((prev) => prev.filter((e) => e.id !== deleteDialog.employeeId));
      } else {
        toast.error(res.message || 'Failed to delete employee');
      }
    } catch (error) {
      toast.error('Something went wrong while deleting employee');
    } finally {
      setDeletingId(null);
      setDeleteDialog({
        open: false,
        employeeId: null,
        employeeName: null,
        employeePhone: '',
      });
      setSelectedDeleteTitle('');
      setDeleteReasonInput('');
      setIsPermanentDelete(false);
    }
  };

  // Handle Toggle Status with Reason
  const handleToggleStatus = async (reason: string) => {
    if (!toggleDialog.employeeId) return;

    setTogglingId(toggleDialog.employeeId);

    try {
      const res = toggleDialog.currentStatus
        ? await deactivateUser(toggleDialog.employeeId, reason)
        : await activateUser(toggleDialog.employeeId, reason);

      if (!res?.error) {
        toast.success(
          res.message || `Employee ${toggleDialog.currentStatus ? 'deactivated' : 'activated'} successfully`
        );
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === toggleDialog.employeeId ? { ...emp, status: !toggleDialog.currentStatus } : emp
          )
        );
        setToggleDialog({
          open: false,
          employeeId: null,
          employeeName: null,
          currentStatus: false,
        });
      } else {
        toast.error(res.message || 'Failed to update employee status');
      }
    } catch (error) {
      toast.error('Something went wrong while updating employee status');
      throw error; // Re-throw to let ToggleStatusDialog handle loading state
    } finally {
      setTogglingId(null);
    }
  };

  // Filter Logic
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      (emp.profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (emp.id?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'active' ? emp.status === true : emp.status === false;

    return matchesSearch && matchesStatus;
  });

  // Sorting Logic
  const sortedEmployees = React.useMemo(() => {
    if (!sortConfig.key) return filteredEmployees;

    return [...filteredEmployees].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key!];
      const bValue = (b as any)[sortConfig.key!];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredEmployees, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  // Pagination Logic
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEmployees = sortedEmployees.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const generatePageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    if (currentPage <= 3) {
      pages.push(1, 2, 3);
      pages.push('ellipsis');
      pages.push(totalPages);
      return pages;
    }

    if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push('ellipsis');
      pages.push(totalPages - 2, totalPages - 1, totalPages);
      return pages;
    }

    pages.push(1);
    pages.push('ellipsis');
    pages.push(currentPage - 1, currentPage, currentPage + 1);
    pages.push('ellipsis');
    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="foreground flex justify-center p-4">
      <div className="bg-sidebar w-full rounded p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 w-full">
          <div className="flex items-center justify-between">
            <p className="text-md font-semibold">Employees</p>
            <Link
              href="/employee-management/add-employee"
              className="bg-primary text-background flex cursor-pointer items-center rounded p-2 pr-3 pl-3 text-sm"
            >
              <Plus className="mr-2 h-5 w-5" /> Add Employee
            </Link>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-1/3">
            <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border py-2 pr-10 pl-3 text-sm"
            />
          </div>

          <div className="relative z-50 w-full sm:w-1/2 md:w-1/3 lg:w-1/5 xl:w-1/6">
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="bg-sidebar text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2 text-left text-sm"
            >
              <span>{statusFilter === 'all' ? 'All Status' : statusFilter === 'active' ? 'Active' : 'Inactive'}</span>
              <ChevronDown className="text-foreground ml-2 h-4 w-4" />
            </button>
            {isStatusDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsStatusDropdownOpen(false)} />
                <div className="bg-sidebar absolute top-full left-0 z-50 mt-1 w-full cursor-pointer rounded border shadow-lg">
                  {['all', 'active', 'inactive'].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setStatusFilter(option);
                        setIsStatusDropdownOpen(false);
                      }}
                      className="text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full cursor-pointer px-3 py-2 text-left text-sm"
                    >
                      {option === 'all' ? 'All Status' : option === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Employee Table */}
        <div className="w-full min-w-full sm:w-[560px] md:w-[540px] lg:w-[900px] xl:w-[1100px]">
          <CommonTable
            columns={[
              {
                key: 'sno',
                label: 'S.No.',
                render: (_, index) => startIndex + index + 1,
              },
              {
                key: 'firstName',
                label: 'Name',
                sortable: true,
                render: (emp) => emp.profile.name?.trim() || '-',
              },
              {
                key: 'employeeId',
                label: 'Employee ID',
                sortable: true,
                render: (emp) => emp.id,
              },
              {
                key: 'phoneNumber',
                label: 'Phone Number',
                sortable: true,
                render: (emp) => emp.phone,
              },
              {
                key: 'role',
                label: 'Role',
                render: (emp) => (
                  <div className="flex flex-wrap gap-1">
                    {emp.roles.map((role) => (
                      <span
                        key={role.id}
                        className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                render: (emp) => {
                  const isActive = emp.status === true;
                  const isToggling = togglingId === emp.id;

                  return (
                    <div className="ml-2 flex items-center gap-2">
                      <button
                        onClick={() =>
                          setToggleDialog({
                            open: true,
                            employeeId: emp.id,
                            employeeName: emp.profile.name,
                            currentStatus: isActive,
                          })
                        }
                        disabled={isToggling}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                          isActive ? 'bg-green-600 focus:ring-green-500' : 'bg-gray-300 focus:ring-gray-400'
                        } ${isToggling ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                },
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (emp) => (
                  <div className="mr-2 flex justify-end gap-2">
                    <Link href={`/employee-management/employee/${emp.id}`}>
                      <Eye className="text-foreground w-5 cursor-pointer" />
                    </Link>
                    <Trash2
                      className="text-foreground h-5 w-5 cursor-pointer hover:text-red-600"
                      onClick={() => openDeleteDialog(emp.id, emp.profile.name, emp.phone)}
                    />
                  </div>
                ),
              },
            ]}
            data={currentEmployees}
            emptyMessage="No employees found."
            sortConfig={sortConfig}
            onSort={handleSort}
          />

          {/* Pagination */}
          {sortedEmployees.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {pageNumbers.map((page, index) => {
                    if (page === 'ellipsis') {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page as number);
                          }}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      {/* Delete Dialog with Reasons */}
      {deleteDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-background w-full max-w-md rounded-lg p-6">
            <h2 className="text-lg font-semibold">Delete Employee</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Are you sure you want to delete employee <b>{deleteDialog.employeeName}</b>?
            </p>

            {loadingReasons ? (
              <div className="mt-4 flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm">Loading reasons...</span>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {/* Delete Title Dropdown */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Delete Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedDeleteTitle}
                    onChange={(e) => setSelectedDeleteTitle(e.target.value)}
                    className="focus:border-primary focus:ring-primary w-full rounded border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                  >
                    <option value="">Select a reason</option>
                    {deleteReasons.map((reason, index) => (
                      <option key={index} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delete Reason Input */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Additional Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={deleteReasonInput}
                    onChange={(e) => setDeleteReasonInput(e.target.value)}
                    placeholder="Please provide more details..."
                    rows={3}
                    className="focus:border-primary focus:ring-primary w-full rounded border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                  />
                </div>

                {/* Permanent Delete Checkbox */}
                <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-3">
                  <input
                    type="checkbox"
                    id="permanentDelete"
                    checked={isPermanentDelete}
                    onChange={(e) => setIsPermanentDelete(e.target.checked)}
                    className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-red-600 focus:ring-2 focus:ring-red-500"
                  />
                  <label htmlFor="permanentDelete" className="cursor-pointer text-sm">
                    <span className="font-medium text-red-700">Permanent Delete</span>
                    <p className="text-muted-foreground mt-1 text-xs">
                      This action cannot be undone. The employee data will be permanently removed from the system.
                    </p>
                  </label>
                </div>

                {/* Warning when permanent delete is selected */}
                {isPermanentDelete && (
                  <div className="flex items-start gap-2 rounded-md border border-orange-200 bg-orange-50 p-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
                    <p className="text-xs text-orange-800">
                      <strong>Warning:</strong> You have selected permanent delete. This employee&apos;s data will be
                      completely removed and cannot be recovered.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialog({
                    open: false,
                    employeeId: null,
                    employeeName: null,
                    employeePhone: '',
                  });
                  setSelectedDeleteTitle('');
                  setDeleteReasonInput('');
                  setIsPermanentDelete(false);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={deletingId === deleteDialog.employeeId || loadingReasons}
                onClick={handleDeleteEmployee}
              >
                {deletingId === deleteDialog.employeeId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isPermanentDelete ? (
                  'Permanently Delete'
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Status Dialog Component */}
      <ToggleStatusDialog
        isOpen={toggleDialog.open}
        userName={toggleDialog.employeeName}
        currentStatus={toggleDialog.currentStatus}
        userType="employee"
        onClose={() =>
          setToggleDialog({
            open: false,
            employeeId: null,
            employeeName: null,
            currentStatus: false,
          })
        }
        onConfirm={handleToggleStatus}
        isLoading={togglingId === toggleDialog.employeeId}
      />
    </div>
  );
};

export default Employee;
