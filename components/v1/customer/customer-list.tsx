'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, EyeIcon, Search, Trash2, Loader2 } from 'lucide-react';
import CommonTable from '@/components/v1/common/common-table/common-table';
import { deleteCustomer, getAllCustomers } from '@/apis/create-customer.api';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

// Updated Customer Interface
interface Customer {
  id: string;
  phoneNumber: string;
  status: boolean | 'ACTIVE' | 'INACTIVE'; //  handles both API formats
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  createdAt: string;
}

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const res = await getAllCustomers(1, 50);
      if (!res.error && Array.isArray(res.payload)) {
        setCustomers(res.payload);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      toast.error('Failed to load customers. Please try again.');
      setCustomers([]);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    customerId: string | null;
    customerName: string | null;
    customerPhoneNumber: string;
  }>({ open: false, customerId: null, customerName: null, customerPhoneNumber: '' });

  const openDeleteDialog = (customerId: string, customerName: string | null, customerPhoneNumber: string) => {
    setDeleteDialog({
      open: true,
      customerId,
      customerName,
      customerPhoneNumber,
    });
  };
  const handleDeleteCustomer = async () => {
    if (!deleteDialog.customerId) return;

    setDeletingId(deleteDialog.customerId);

    try {
      const res = await deleteCustomer(deleteDialog.customerId);

      if (!res?.error) {
        toast.success(res.message || 'Customer deleted successfully');

        setDeleteDialog({
          open: false,
          customerId: null,
          customerName: null,
          customerPhoneNumber: '',
        });

        // Option 1 (recommended): optimistic UI update
        setCustomers((prev) => prev.filter((c) => c.id !== deleteDialog.customerId));

        // Option 2 (safe): refetch
        // await fetchCustomers();
      } else {
        toast.error(res.message || 'Failed to delete customer');
      }
    } catch (error) {
      toast.error('Something went wrong while deleting customer');
    } finally {
      setDeletingId(null);
    }
  };

  //  Filter + Search logic FIXED for boolean status
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const fullName = `${cust.firstName ?? ''} ${cust.lastName ?? ''}`.trim().toLowerCase();

      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        cust.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cust.email ?? '').toLowerCase().includes(searchTerm.toLowerCase());

      const isActive = cust.status === true || cust.status === 'ACTIVE';
      const isInactive = cust.status === false || cust.status === 'INACTIVE';

      const matchesStatus = statusFilter === 'all' ? true : statusFilter === 'active' ? isActive : isInactive;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  // Sorting Logic
  const sortedCustomers = useMemo(() => {
    if (!sortConfig.key) return filteredCustomers;

    return [...filteredCustomers].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key!];
      const bValue = (b as any)[sortConfig.key!];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredCustomers, sortConfig]);

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

  // Pagination
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCustomers = sortedCustomers.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Pagination number generator
  const generatePageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    if (currentPage <= 3) {
      pages.push(1, 2, 3, 'ellipsis', totalPages);
      return pages;
    }

    if (currentPage >= totalPages - 2) {
      pages.push(1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages);
      return pages;
    }

    pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  // Table Columns
  const columns = [
    {
      key: 'sno',
      label: 'S.No.',
      render: (_row: Customer, index: number) => startIndex + index + 1,
    },
    {
      key: 'firstName',
      label: 'Name',
      sortable: true,
      render: (cust: Customer) => `${cust.firstName ?? ''} ${cust.lastName ?? ''}`.trim() || '-',
    },
    {
      key: 'phoneNumber',
      label: 'Phone Number',
      sortable: true,
      render: (cust: Customer) => cust.phoneNumber ?? '-',
    },
    {
      key: 'email',
      label: 'Email',
      render: (cust: Customer) => cust.email ?? '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (cust: Customer) => {
        const isActive = cust.status === true || cust.status === 'ACTIVE';
        return (
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created At',
      sortable: true,
      render: (cust: Customer) =>
        new Date(cust.createdAt).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (cust: Customer) => (
        <div className="mr-2 flex justify-end gap-2">
          <EyeIcon
            className="text-primary w-5 cursor-pointer"
            onClick={() => (window.location.href = `/customer/view/${cust.id}`)}
          />

          <Trash2
            className={`h-5 w-5 cursor-pointer ${!cust.status ? 'cursor-not-allowed opacity-40' : 'text-foreground'}`}
            onClick={() => {
              if (!cust.status) return;
              openDeleteDialog(cust.id, cust.firstName, cust.phoneNumber);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="foreground flex justify-center p-4">
      <div className="bg-sidebar w-full rounded p-4 shadow-lg">
        <div className="mb-4 w-full">
          <div className="flex items-center justify-between">
            <p className="text-md font-semibold">Customer list</p>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-1/3">
            <Search className="text-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />

            <input
              type="text"
              placeholder="Search by name or email..."
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
                        setStatusFilter(option as 'all' | 'active' | 'inactive');
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

        {/* Table */}
        <CommonTable
          columns={columns}
          data={currentCustomers}
          emptyMessage="No customers found."
          sortConfig={sortConfig}
          onSort={handleSort}
        />

        {/* Pagination */}
        {sortedCustomers.length > 0 && (
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

                {pageNumbers.map((page, index) =>
                  page === 'ellipsis' ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
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
                  )
                )}

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
      {/* Delete Confirmation Dialog */}
      {deleteDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background w-full max-w-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold">Delete Customer</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Are you sure you want to delete customer <b>{deleteDialog.customerName}</b>?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setDeleteDialog({ open: false, customerId: null, customerName: null, customerPhoneNumber: '' })
                }
              >
                Cancel
              </Button>

              <Button
                className="bg-red-600 text-white"
                disabled={deletingId === deleteDialog.customerId}
                onClick={handleDeleteCustomer}
              >
                {deletingId === deleteDialog.customerId ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
