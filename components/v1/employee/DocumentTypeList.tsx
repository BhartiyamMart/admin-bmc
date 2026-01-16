'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  // Filter document types
  const filteredDocumentTypes = documentTypes.filter((doc) =>
    doc.code.toLowerCase().includes(search.toLowerCase()) ||
    doc.label.toLowerCase().includes(search.toLowerCase())
  );

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
          <Trash2 className="w-5 cursor-pointer text-red-600" onClick={() => openDeleteDialog(doc.id)} />
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

        <CommonTable
          columns={columns}
          data={currentDocumentTypes}
          emptyMessage={loading ? 'Loading...' : 'No Document Types Found'}
          sortConfig={sortConfig}
          onSort={handleSort}
        />

        {totalPages > 1 && (
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>

            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}

            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
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
