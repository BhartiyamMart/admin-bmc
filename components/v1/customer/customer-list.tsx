'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { EyeIcon, Trash2 } from 'lucide-react';
import CommonTable from '@/components/v1/common/common-table/common-table';
import { getAllCustomers } from '@/apis/create-customer.api';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// ✅ Define a strict Customer interface
interface Customer {
  id: string;
  phoneNumber: string;
  status: 'ACTIVE' | 'INACTIVE';
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
  const itemsPerPage = 8;

  // 🧩 Fetch customers from API
  const fetchCustomers = async () => {
    try {
      const page = 1;
      const limit = 50;
      const res = await getAllCustomers(page, limit);
      if (!res.error && Array.isArray(res.payload)) {
        setCustomers(res.payload);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setCustomers([]);
    }
  };

  // 🕒 Fetch initially
  useEffect(() => {
    fetchCustomers();
  }, []);

  // 🔍 Filter + Search logic
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const fullName = `${cust.firstName ?? ''} ${cust.lastName ?? ''}`.trim().toLowerCase();

      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        cust.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cust.email ?? '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? cust.status === 'ACTIVE'
            : cust.status === 'INACTIVE';

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  // 📊 Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // 🧭 Pagination controls
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 📊 Generate page numbers - FIXED VERSION
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

  // ✅ Typed table columns
  const columns: {
    key: keyof Customer | 'sno' | 'actions';
    label: string;
    render?: (row: Customer, index: number) => React.ReactNode;
  }[] = [
    {
      key: 'sno',
      label: 'S.No',
      render: (_row, index) => startIndex + index + 1,
    },
    {
      key: 'firstName',
      label: 'Name',
      render: (cust) => `${cust.firstName ?? ''} ${cust.lastName ?? ''}`.trim() || '-',
    },
    {
      key: 'phoneNumber',
      label: 'Phone Number',
      render: (cust) => cust.phoneNumber ?? '-',
    },
    {
      key: 'email',
      label: 'Email',
      render: (cust) => cust.email ?? '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (cust) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            cust.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {cust.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (cust) =>
        new Date(cust.createdAt).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (cust) => (
        <div className="flex justify-end gap-2 pr-4">
          <EyeIcon
            className="text-primary w-5 cursor-pointer"
            onClick={() => {
              window.location.href = `/customer/view/${cust.id}`;
            }}
          />
          <Trash2 className="text-primary w-5 cursor-pointer" onClick={() => console.log('Delete:', cust.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="foreground flex justify-center p-4">
      <div className="bg-sidebar w-full rounded-lg p-4 shadow-lg">
        <div className="mb-4 w-full">
          <div className="flex items-center justify-between">
            <p className="text-md font-semibold">Customer list</p>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            className="focus:border-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none sm:w-1/3"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
            }}
            className="bg-sidebar focus:border-primary w-full cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none sm:w-1/5"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="w-full min-w-[300px] min-w-full sm:w-[560px] md:w-[640px] lg:w-[900px] xl:w-[1100px]">
          {/* Table */}
          <CommonTable columns={columns} data={currentCustomers} emptyMessage="No customers found." />

          {/* Shadcn Pagination - Aligned to Right */}
          {filteredCustomers.length > itemsPerPage && (
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

                  {/* Page Numbers - Max 3 visible */}
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
    </div>
  );
};

export default CustomerList;
