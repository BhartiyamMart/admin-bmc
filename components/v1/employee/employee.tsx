'use client';

import Link from 'next/link';
import { ChevronDown, Eye, Plus, Search, Trash2 } from 'lucide-react';
import useEmployeeRoleStore from '@/store/employeeRoleStore';
import toast from 'react-hot-toast';
import React, { useEffect, useState } from 'react';
import { getEmployeeRole } from '@/apis/employee-role.api';
import CommonTable from '@/components/v1/common/common-table/common-table';
import { deleteEmployee, getEmployee } from '@/apis/create-employee.api';
import type { Employee } from '@/interface/common.interface';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const Employee = () => {
  const setRoles = useEmployeeRoleStore((state) => state.setRoles);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [permanentDelete, setPermanentDelete] = useState(false);
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

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // const page = 3;
        // const limit = 60;
        const response = await getEmployeeRole();

        if (!response.error && response.payload) {
          const rolesArray = Array.isArray(response.payload) ? response.payload : [response.payload];

          const transformedRoles = rolesArray.map((role) => ({
            id: role.id,
            name: role.name,
            status: role.status,
            createdAt: undefined,
            updatedAt: undefined,
          }));

          setRoles(transformedRoles);
        } else {
          toast.error(response.message || 'Failed to fetch roles');
        }
      } catch (error) {
        console.error('Failed to fetch employee roles:', error);
        toast.error('Failed to fetch employee roles');
      }
    };

    fetchRoles();
  }, [setRoles]);
  const fetchEmployees = async () => {
    try {
      const response = await getEmployee();

      if (!response.error && response.payload.employees) {
        const employeeArray = response.payload.employees;

        const employees = employeeArray.map((employee) => ({
          id: employee.id || employee.employeeId,
          employeeId: employee.employeeId,
          firstName: employee.firstName || '',
          middleName: employee.middleName || '',
          lastName: employee.lastName || '',
          email: employee.email || '',
          phoneNumber: employee.phoneNumber || '',
          roleId: employee.roleId,
          role: employee.role,
          storeId: employee.storeId || '',
          warehouseId: employee.warehouseId || '',
          status: employee.status,
          passwordCount: employee.passwordCount,
          createdAt: employee.createdAt,
          updatedAt: employee.updatedAt,
          permissions: employee.permissions || [],
        }));

        setEmployees(employees);
      } else {
        toast.error(response.message || 'Failed to fetch employees');
      }
    } catch (error) {
      console.error('Failed to fetch employee data:', error);
      toast.error('Failed to fetch employee data');
    }
  };
  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setPermanentDelete(false);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEmployeeId) return;

    try {
      const response = await deleteEmployee(selectedEmployeeId, permanentDelete);
      if (!response || response.error) {
        toast.error(response?.message || 'Failed to delete employee');
      } else {
        toast.success('Employee deleted successfully');
        setEmployees((prev) => prev.filter((e) => e.employeeId !== selectedEmployeeId));
        fetchEmployees();
      }
    } catch (error) {
      console.error('Delete employee failed:', error);
      toast.error('Failed to delete employee');
    } finally {
      setIsDialogOpen(false);
      setSelectedEmployeeId(null);
      setPermanentDelete(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setSelectedEmployeeId(null);
    setPermanentDelete(false);
  };

  // Filter logic
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      (emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'active' ? emp.status === true : emp.status === false;

    return matchesSearch && matchesStatus;
  });

  // Sorting logic
  const sortedEmployees = React.useMemo(() => {
    if (!sortConfig.key) return filteredEmployees;

    return [...filteredEmployees].sort((a, b) => {
      // Handle nested properties or specific key mapping if needed
      // 'a' is Employee type
      const aValue = (a as any)[sortConfig.key!];
      const bValue = (b as any)[sortConfig.key!];

      // Handle null/undefined for safety
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

  // Pagination logic
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEmployees = sortedEmployees.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Pagination controls
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers - Max 3 visible pages + ellipsis + last page
  const generatePageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];

    // If total pages is 4 or less, show all pages
    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Case 1: Current page is in first 3 pages (1, 2, or 3)
    if (currentPage <= 3) {
      pages.push(1, 2, 3);
      pages.push('ellipsis');
      pages.push(totalPages);
      return pages;
    }

    // Case 2: Current page is near the end (last 3 pages)
    if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push('ellipsis');
      pages.push(totalPages - 2, totalPages - 1, totalPages);
      return pages;
    }

    // Case 3: Current page is in the middle
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
              className="bg-sidebar flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2 text-left text-sm"
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
                      className="w-full cursor-pointer px-3 py-2 text-left text-sm"
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
                render: (emp) => `${emp.firstName} ${emp.middleName || ''} ${emp.lastName || ''}`.trim(),
              },
              { key: 'employeeId', label: 'Employee ID', sortable: true, render: (emp) => emp.employeeId },

              { key: 'phoneNumber', label: 'Phone Number', sortable: true },
              { key: 'role', label: 'Role' },

              {
                key: 'status',
                label: 'Status',
                render: (emp) => (
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${emp.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                  >
                    {emp.status ? 'Active' : 'Inactive'}
                  </span>
                ),
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (emp) => (
                  <div className="mr-2 flex justify-end gap-2">
                    <Link href={`/employee-management/employee/${emp.employeeId}`}>
                      <Eye className="text-foreground w-5 cursor-pointer" />
                    </Link>
                    <button onClick={() => handleDelete(emp.employeeId)}>
                      <Trash2 className="text-foreground w-5 cursor-pointer" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={currentEmployees}
            emptyMessage="No employees found."
            sortConfig={sortConfig}
            onSort={handleSort}
          />

          {/* Shadcn Pagination - Aligned to Right */}
          {filteredEmployees.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Pagination>
                <PaginationContent>
                  {/* Previous Button */}
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

                  {/* Page Numbers */}
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

                  {/* Next Button */}
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

      {/* Delete Confirmation Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCancelDelete} aria-hidden="true" />
          <div className="relative z-10 w-11/12 max-w-md rounded bg-white p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold">Delete Employee</h3>
            <p className="mb-4 text-sm text-gray-700">Are you sure you want to delete this employee?</p>
            <div>
              <label className="mb-4 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={permanentDelete}
                  onChange={(e) => setPermanentDelete(e.target.checked)}
                  className="text-foreground h-4 w-4 cursor-pointer rounded border-gray-300"
                />
                <span className="text-xs">Permanent delete</span>
              </label>

              <div className="flex justify-end gap-3">
                <button onClick={handleCancelDelete} className="cursor-pointer rounded border px-4 py-2">
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="cursor-pointer rounded bg-red-600 px-4 py-2 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employee;
