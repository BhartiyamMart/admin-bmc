'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { ChevronDown, Eye, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CommonTable from '@/components/v1/common/common-table/common-table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function CustomerFeedback() {
  const customerFeedback = [
    {
      id: 1,
      name: 'Service Feedback',
      customerName: 'Ramesh Kumar',
      rating: '4 / 5',
      createdAt: '2025-01-12',
    },
    {
      id: 2,
      name: 'Product Quality',
      customerName: 'Anita Sharma',
      rating: '5 / 5',
      createdAt: '2025-01-14',
    },
    {
      id: 3,
      name: 'Delivery Speed',
      customerName: 'Suresh Patel',
      rating: '3 / 5',
      createdAt: '2025-01-15',
    },
    {
      id: 4,
      name: 'Packaging',
      customerName: 'Meena Gupta',
      rating: '4 / 5',
      createdAt: '2025-01-10',
    },
    {
      id: 5,
      name: 'App Experience',
      customerName: 'Vikram Singh',
      rating: '2 / 5',
      createdAt: '2025-01-08',
    },
  ];

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  // Filter + Search logic
  const filteredFeedback = useMemo(() => {
    return customerFeedback.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase());

      const itemRating = item.rating.split(' / ')[0];
      const matchesRating = ratingFilter === 'all' ? true : itemRating === ratingFilter;

      return matchesSearch && matchesRating;
    });
  }, [customerFeedback, searchTerm, ratingFilter]);

  // Sorting Logic
  const sortedFeedback = useMemo(() => {
    if (!sortConfig.key) return filteredFeedback;

    return [...filteredFeedback].sort((a, b) => {
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
  }, [filteredFeedback, sortConfig]);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, ratingFilter]);

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
      align: 'right' as const,
      render: (item: any) => (
        <div className="flex items-center justify-end gap-3 pr-4">
          <Eye
            className="h-4 w-4 cursor-pointer text-black"
            strokeWidth={2}
            aria-label="View Feedback"
            onClick={() => console.log('View', item.id)}
          />

          <Trash2
            className="h-4 w-4 cursor-pointer text-black"
            strokeWidth={2}
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

        {/* Search + Filter */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-1/3">
            <Search className="text-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border py-2 pr-10 pl-3 text-sm focus:outline-primary"
            />
          </div>

          <div className="relative z-50 w-full sm:w-1/2 md:w-1/3 lg:w-1/5 xl:w-1/6">
            <button
              onClick={() => setIsRatingDropdownOpen(!isRatingDropdownOpen)}
              className="bg-sidebar flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2 text-left text-sm"
            >
              <span>{ratingFilter === 'all' ? 'All Ratings' : `${ratingFilter} Stars`}</span>
              <ChevronDown className="text-foreground ml-2 h-4 w-4" />
            </button>
            {isRatingDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsRatingDropdownOpen(false)} />
                <div className="bg-sidebar absolute top-full left-0 z-50 mt-1 w-full cursor-pointer rounded border shadow-lg">
                  {['all', '5', '4', '3', '2', '1'].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setRatingFilter(option as any);
                        setIsRatingDropdownOpen(false);
                      }}
                      className="w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-gray-100"
                    >
                      {option === 'all' ? 'All Ratings' : `${option} Stars`}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
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
          {sortedFeedback.length > 0 && (
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
    </div>
  );
}
