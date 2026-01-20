'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import CommonTable from '@/components/v1/common/common-table/common-table';
import { getDocumentType, deleteDocumentType } from '@/apis/create-document-type.api';

interface DocumentType {
  id: string;
  code: string;
  label: string;
  status?: boolean;
}

const DocumentTypeList = () => {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Pagination
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  // Filter document types
 // Filter document types by BOTH search text and status dropdown
const filteredDocumentTypes = documentTypes.filter((doc) => {
  // 1. Search Logic
  const matchesSearch = 
    doc.code.toLowerCase().includes(search.toLowerCase()) ||
    doc.label.toLowerCase().includes(search.toLowerCase());

  // 2. Status Logic (Convert 'active'/'inactive' strings to booleans)
  const matchesStatus = 
    statusFilter === 'all' || 
    (statusFilter === 'active' ? doc.status === true : doc.status === false);

  return matchesSearch && matchesStatus;
});


  // Sorting Logic
  const sortedDocumentTypes = React.useMemo(() => {
    if (!sortConfig.key) return filteredDocumentTypes;

    return [...filteredDocumentTypes].sort((a, b) => {
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
  }, [filteredDocumentTypes, sortConfig]);

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
  

  // Pagination calculations
  const totalPages = Math.ceil(sortedDocumentTypes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentDocumentTypes = sortedDocumentTypes.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [permanentDelete, setPermanentDelete] = useState(false);

  // Fetch document types
  const fetchDocumentTypes = async () => {
    setLoading(true);
    try {
      const response = await getDocumentType();

      if (response?.payload?.documentTypes) {
        setDocumentTypes(response.payload.documentTypes);
      } else {
        console.warn('No document types found:', response);
      }
    } catch (error) {
      console.error('Failed to fetch document types:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  // Open dialog when delete icon clicked
  const openDeleteDialog = (id: string) => {
    setSelectedId(id);
    setIsDialogOpen(true);
    setPermanentDelete(false);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    try {
      const response = await deleteDocumentType(selectedId, permanentDelete);

      if (!response.error) {
        setDocumentTypes((prev) => prev.filter((d) => d.id !== selectedId));
      } else {
        alert('Failed to delete: ' + response.message);
      }
    } catch (error) {
      console.error('Error deleting document type', error);
    } finally {
      setIsDialogOpen(false);
      setSelectedId(null);
      setPermanentDelete(false);
    }
  };

  // Cancel dialog
  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setSelectedId(null);
    setPermanentDelete(false);
  };

  // Table Columns
  const columns = [
    {
      key: 'sno',
      label: 'S.No',
      render: (_: DocumentType, index: number) => startIndex + index + 1,
    },
    { key: 'code', label: 'Document Code', sortable: true },
    { key: 'label', label: 'Label', sortable: true },

    {
      key: 'status',
      label: 'Status',
      render: (doc: DocumentType) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${doc.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
        >
          {doc.status ? 'Active' : 'Inactive'}
        </span>
      ),
    },

    {
      key: 'actions',
      label: 'Actions',
      render: (doc: DocumentType) => (
        <div className="mr-2 flex justify-end gap-2 pr-4">
          <Trash2 className="w-5 cursor-pointer text-foreground" onClick={() => openDeleteDialog(doc.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-sidebar flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="w-full overflow-y-auto rounded p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between">
          <p className="text-md font-semibold">Document Types</p>

          <Link href="/employee-management/document-typeform">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Document Type
            </Button>
          </Link>
        </div>
        <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        {/* Search Input with Icon */}
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search by Code or Label..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-gray-200 py-2.5 pl-4 pr-10 text-sm focus:border-primary focus:outline-none"
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-foreground" />
        </div>

        {/* Status Dropdown Filter */}
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

        <CommonTable
          columns={columns}
          data={currentDocumentTypes}
          emptyMessage={loading ? 'Loading...' : 'No Document Types Found'}
          sortConfig={sortConfig}
          onSort={handleSort}
        />

        {/* Pagination */}
        {filteredDocumentTypes.length > 0 && (
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
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={handleCancelDelete} />

          {/* Dialog Box */}
          <div className="relative z-10 w-11/12 max-w-md rounded bg-white p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold">Delete Document Type</h3>

            <p className="mb-4 text-sm text-gray-700">Are you sure you want to delete this document type?</p>

            <label className="mb-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={permanentDelete}
                onChange={(e) => setPermanentDelete(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-gray-300"
              />
              <span className="text-xs">Permanent delete</span>
            </label>

            <div className="flex justify-end gap-3">
              <button onClick={handleCancelDelete} className="cursor-pointer rounded border px-4 py-2">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="cursor-pointer rounded bg-red-600 px-4 py-2 text-white">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentTypeList;
