'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, EyeIcon, Search, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import CommonTable from '@/components/v1/common/common-table/common-table';
import { activateUser, deactivateUser, deleteCustomer, getAllCustomers, deleteUserReasons } from '@/apis/customer.api';
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
import { CustomersListData } from '@/interface/customer.interface';

interface Customer {
  id: string;
  phoneNumber: string;
  status: boolean;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  createdAt: string;
}

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<CustomersListData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Delete reasons state
  const [deleteReasons, setDeleteReasons] = useState<string[]>([]);
  const [loadingReasons, setLoadingReasons] = useState(false);
  const [selectedDeleteTitle, setSelectedDeleteTitle] = useState<string>('');
  const [deleteReasonInput, setDeleteReasonInput] = useState<string>('');
  
  // ✅ Permanent delete state
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);

  const [toggleDialog, setToggleDialog] = useState<{
    open: boolean;
    customerId: string | null;
    customerName: string | null;
    currentStatus: boolean;
  }>({ open: false, customerId: null, customerName: null, currentStatus: false });

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  const fetchCustomers = async () => {
    try {
      const res = await getAllCustomers('customer', 1, 50);
      if (res.status === 200) {
        setCustomers(res.payload.users);
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

  const fetchDeleteReasons = async () => {
    setLoadingReasons(true);
    try {
      const res = await deleteUserReasons();
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

  const openDeleteDialog = async (customerId: string, customerName: string | null, customerPhoneNumber: string) => {
    setDeleteDialog({
      open: true,
      customerId,
      customerName,
      customerPhoneNumber,
    });
    
    // ✅ Reset form fields including permanent delete
    setSelectedDeleteTitle('');
    setDeleteReasonInput('');
    setIsPermanentDelete(false);
    
    // Fetch delete reasons
    await fetchDeleteReasons();
  };

  const handleDeleteCustomer = async () => {
    if (!deleteDialog.customerId) return;

    // Validation
    if (!selectedDeleteTitle) {
      toast.error('Please select a delete reason');
      return;
    }

    if (!deleteReasonInput.trim()) {
      toast.error('Please provide additional details');
      return;
    }

    setDeletingId(deleteDialog.customerId);

    try {
      // ✅ Pass deleteTitle, deleteReason, and isPermanent to API
      const res = await deleteCustomer(deleteDialog.customerId, {
        deleteTitle: selectedDeleteTitle,
        deleteReason: deleteReasonInput.trim(),
        permanentDelete: isPermanentDelete,
      });

      if (!res?.error) {
        toast.success(res.message || 'Customer deleted successfully');

        setDeleteDialog({
          open: false,
          customerId: null,
          customerName: null,
          customerPhoneNumber: '',
        });

        setCustomers((prev) => prev.filter((c) => c.id !== deleteDialog.customerId));
      } else {
        toast.error(res.message || 'Failed to delete customer');
      }
    } catch (error) {
      toast.error('Something went wrong while deleting customer');
    } finally {
      setDeletingId(null);
      setDeleteDialog({
        open: false,
        customerId: null,
        customerName: null,
        customerPhoneNumber: '',
      });
      setSelectedDeleteTitle('');
      setDeleteReasonInput('');
      setIsPermanentDelete(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleDialog.customerId) return;

    setTogglingId(toggleDialog.customerId);

    try {
      const res = toggleDialog.currentStatus
        ? await deactivateUser(toggleDialog.customerId)
        : await activateUser(toggleDialog.customerId);

      if (!res?.error) {
        toast.success(
          res.message || `Customer ${toggleDialog.currentStatus ? 'deactivated' : 'activated'} successfully`
        );

        setCustomers((prev) =>
          prev.map((c) => (c.id === toggleDialog.customerId ? { ...c, status: !toggleDialog.currentStatus } : c))
        );

        setToggleDialog({
          open: false,
          customerId: null,
          customerName: null,
          currentStatus: false,
        });
      } else {
        toast.error(res.message || 'Failed to update customer status');
      }
    } catch (error) {
      toast.error('Something went wrong while updating customer status');
    } finally {
      setTogglingId(null);
    }
  };

  const transformedCustomers = useMemo((): Customer[] => {
    return customers.map((cust) => ({
      id: cust.id,
      phoneNumber: cust.phone,
      status: cust.status,
      firstName: cust.profile.name,
      lastName: null,
      email: cust.email,
      createdAt: cust.createdAt,
    }));
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return transformedCustomers.filter((cust) => {
      const fullName = `${cust.firstName ?? ''}`.trim().toLowerCase();

      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        cust.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cust.email ?? '').toLowerCase().includes(searchTerm.toLowerCase());

      const isActive = cust.status === true;
      const isInactive = cust.status === false;

      const matchesStatus = statusFilter === 'all' ? true : statusFilter === 'active' ? isActive : isInactive;

      return matchesSearch && matchesStatus;
    });
  }, [transformedCustomers, searchTerm, statusFilter]);

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
        const isActive = cust.status === true;
        const isToggling = togglingId === cust.id;

        return (
          <div className="ml-2 flex items-center gap-2">
            <button
              onClick={() =>
                setToggleDialog({
                  open: true,
                  customerId: cust.id,
                  customerName: cust.firstName,
                  currentStatus: isActive,
                })
              }
              disabled={isToggling}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
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
            className="text-foreground h-5 w-5 cursor-pointer"
            onClick={() => {
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

        <CommonTable
          columns={columns}
          data={currentCustomers}
          emptyMessage="No customers found."
          sortConfig={sortConfig}
          onSort={handleSort}
        />

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

      {/* ✅ Updated Delete Dialog with Permanent Delete Checkbox */}
      {deleteDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-background w-full max-w-md rounded-lg p-6">
            <h2 className="text-lg font-semibold">Delete Customer</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Are you sure you want to delete customer <b>{deleteDialog.customerName}</b>?
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
                    className="w-full rounded border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                    className="w-full rounded border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* ✅ Permanent Delete Checkbox */}
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
                      This action cannot be undone. The customer data will be permanently removed from the system.
                    </p>
                  </label>
                </div>

                {/* ✅ Warning when permanent delete is selected */}
                {isPermanentDelete && (
                  <div className="flex items-start gap-2 rounded-md border border-orange-200 bg-orange-50 p-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
                    <p className="text-xs text-orange-800">
                      <strong>Warning:</strong> You have selected permanent delete. This customer's data will be
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
                  setDeleteDialog({ open: false, customerId: null, customerName: null, customerPhoneNumber: '' });
                  setSelectedDeleteTitle('');
                  setDeleteReasonInput('');
                  setIsPermanentDelete(false);
                }}
              >
                Cancel
              </Button>

              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={deletingId === deleteDialog.customerId || loadingReasons}
                onClick={handleDeleteCustomer}
              >
                {deletingId === deleteDialog.customerId ? (
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

      {/* Toggle Status Confirmation Dialog */}
      {toggleDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-background w-full max-w-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold">
              {toggleDialog.currentStatus ? 'Deactivate' : 'Activate'} Customer
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Are you sure you want to {toggleDialog.currentStatus ? 'deactivate' : 'activate'} customer{' '}
              <b>{toggleDialog.customerName}</b>?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setToggleDialog({
                    open: false,
                    customerId: null,
                    customerName: null,
                    currentStatus: false,
                  })
                }
              >
                Cancel
              </Button>

              <Button
                className={toggleDialog.currentStatus ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}
                disabled={togglingId === toggleDialog.customerId}
                onClick={handleToggleStatus}
              >
                {togglingId === toggleDialog.customerId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : toggleDialog.currentStatus ? (
                  'Deactivate'
                ) : (
                  'Activate'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
