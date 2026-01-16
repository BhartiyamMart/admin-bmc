'use client';

import React, { useState } from 'react';
import { CheckCircle, Eye, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CommonTable from '@/components/v1/common/common-table/common-table';

export default function CustomerFeedback() {
  const customerFeedback = [
    {
      id: 1,
      name: 'Service Feedback',
      customerName: 'Ramesh Kumar',
      rating: '4 / 5',
      createdAt: '2025-01-12',
    },
  ];

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  // Sorting Logic
  const sortedFeedback = React.useMemo(() => {
    if (!sortConfig.key) return customerFeedback;

    return [...customerFeedback].sort((a, b) => {
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
  }, [customerFeedback, sortConfig]);

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
  const totalPages = Math.ceil(sortedFeedback.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentFeedback = sortedFeedback.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const columns = [
    {
      key: 'sno',
      label: 'S.No.',
      render: (_: unknown, index: number) => startIndex + index + 1,
    },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'customerName', label: 'Customer Name', sortable: true },
    { key: 'rating', label: 'Rating' },
    { key: 'createdAt', label: 'Created At', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <Eye
            className="h-4 w-4 cursor-pointer text-blue-500"
            aria-label="View Feedback"
            onClick={() => console.log('View', item.id)}
          />
          <CheckCircle
            className="h-4 w-4 cursor-pointer text-green-500"
            aria-label="Approve"
            onClick={() => console.log('Approve', item.id)}
          />
          <XCircle
            className="h-4 w-4 cursor-pointer text-red-500"
            aria-label="Reject"
            onClick={() => console.log('Reject', item.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="bg-sidebar w-full rounded p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-md font-semibold">Customer Feedback</p>
        </div>

        {/* Table Wrapper */}
        <div className="w-full overflow-x-auto">
          <CommonTable
            columns={columns}
            data={currentFeedback}
            emptyMessage="No customer feedback found."
            sortConfig={sortConfig}
            onSort={handleSort}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>

              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
