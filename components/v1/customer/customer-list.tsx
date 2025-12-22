'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { EyeIcon, Search, Trash2 } from 'lucide-react';
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

// Updated Customer Interface
interface Customer {
  id: string;
  phoneNumber: string;
  status: boolean | 'ACTIVE' | 'INACTIVE'; // 🔥 handles both API formats
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
      setCustomers([]);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 🔥 Filter + Search logic FIXED for boolean status
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

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

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
      label: 'S.No',
      render: (_row: Customer, index: number) => startIndex + index + 1,
    },
    {
      key: 'firstName',
      label: 'Name',
      render: (cust: Customer) => `${cust.firstName ?? ''} ${cust.lastName ?? ''}`.trim() || '-',
    },
    {
      key: 'phoneNumber',
      label: 'Phone Number',
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
        <div className="flex justify-end gap-2">
          <EyeIcon
            className="text-primary w-5 cursor-pointer"
            onClick={() => (window.location.href = `/customer/view/${cust.id}`)}
          />
          <Trash2 className="text-primary w-5 cursor-pointer" onClick={() => console.log('Delete:', cust.id)} />
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

        {/* Table */}
        <CommonTable columns={columns} data={currentCustomers} emptyMessage="No customers found." />

        {/* Pagination */}
        {filteredCustomers.length > itemsPerPage && (
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
    </div>
  );
};

export default CustomerList;
