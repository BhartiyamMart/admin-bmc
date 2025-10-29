'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { FilePenLine, Trash2 } from 'lucide-react';
import CommonTable from '@/components/v1/common/common-table/common-table';
import { getAllCustomers } from '@/apis/create-customer.api';

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
      const limit = 100;
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

  // 🕒 Fetch initially and refresh every 5 seconds
  useEffect(() => {
    fetchCustomers();
    const interval = setInterval(fetchCustomers, 5000);
    return () => clearInterval(interval);
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

  // 🧭 Pagination controls
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

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
          <FilePenLine className="text-primary w-5 cursor-pointer" onClick={() => console.log('Edit:', cust.id)} />
          <Trash2 className="text-primary w-5 cursor-pointer" onClick={() => console.log('Delete:', cust.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="bg-sidebar w-full rounded-lg p-4 shadow-lg">
        <div className="mb-4 w-full">
          <div className="flex items-center justify-between">
            <p className="text-md font-semibold">Customer list</p>
          </div>
        </div>

        {/* Header */}
        {/* Search + Filter */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="focus:border-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none sm:w-1/3"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
              setCurrentPage(1);
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

          {/* Pagination */}
          {filteredCustomers.length > 0 && (
            <div className="float-end mt-4 flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className={`cursor-pointer rounded-md border px-3 py-1 ${
                  currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-primary hover:text-white'
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
                className={`cursor-pointer rounded-md border px-3 py-1 ${
                  currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-primary hover:text-white'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
