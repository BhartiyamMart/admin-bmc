'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FilePenLine, Plus, Trash2 } from 'lucide-react';
import CommonTable from '@/components/v1/common/common-table/common-table'; // ✅ Reusable table

// 📌 Define Document type
interface Document {
  id: number;
  name: string;
  customerName: string;
  rating: number;
  createdAt: string;
}

// 📌 Define Column type for reuse
interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T, index: number) => React.ReactNode;
}

const DocumentList = () => {
  const documents = useMemo<Document[]>(
    () => [
      {
        id: 1,
        name: 'Anand',
        customerName: 'Anand Hindustanii',
        rating: 1,
        createdAt: '05 Oct 2025',
      },
    ],
    []
  );

  // 🔍 Search
  const [searchTerm, setSearchTerm] = useState('');

  // 🧭 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 🔍 Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(
      (doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [documents, searchTerm]);

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDocuments = filteredDocuments.slice(startIndex, startIndex + itemsPerPage);

  // 🧭 Pagination controls
  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  // ✅ Table columns (with proper types)
  const columns: Column<Document>[] = [
    {
      key: 'sno',
      label: 'S.No',
      render: (_, index) => startIndex + index + 1,
    },
    { key: 'name', label: 'Name' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'rating', label: 'Rating' },
    { key: 'createdAt', label: 'Created At' },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex justify-end gap-2 pr-4">
          <FilePenLine className="text-primary w-5 cursor-pointer" />
          <Trash2 className="text-primary w-5 cursor-pointer" />
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center bg-sidebar p-4">
      <div className="w-full rounded-lg  p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-md font-semibold">Documents</p>
          <Link href="/employee-management/document-upload">
            <Button className="bg-primary text-background flex rounded-sm p-2 pr-3 pl-3 text-sm">
              <Plus className="mr-2 h-5 w-5" /> Upload
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search by name or customer..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="focus:border-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none sm:w-1/3"
          />
        </div>

        {/* ✅ CommonTable */}
        <div className="w-full min-w-[300px] min-w-full sm:w-[560px] md:w-[640px] lg:w-[900px] xl:w-[1100px]">
          <CommonTable columns={columns} data={currentDocuments} emptyMessage="No documents found." />
        </div>

        {/* 🧭 Pagination */}
        {filteredDocuments.length > 0 && (
          <div className="float-end mt-4 flex w-[30%] items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`rounded-md border px-3 py-1 ${
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
              className={`rounded-md border px-3 py-1 ${
                currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-primary hover:text-white'
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

export default DocumentList;
