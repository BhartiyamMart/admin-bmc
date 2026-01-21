'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trash2, FilePenLine, Plus, Search, ChevronDown } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import CommonTable from '@/components/v1/common/common-table/common-table';
import { getAllFeedbackCategories } from '@/apis/create-time-slot.api';
import { useRouter } from 'next/navigation';

interface FeedbackCategoryType {
  id: string;
  categoryCode: string;
  categoryName: string;
  description: string;
  icon: string | null;
  color: string;
  sortOrder: number;
  ratingType: string;
  maxRating: number;
  ratingLabels: { [key: number]: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function FeedbackCategory() {
  const router = useRouter();
  const [categories, setCategories] = useState<FeedbackCategoryType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const filteredCategories = React.useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        cat.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.categoryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());

      const isActive = cat.isActive === true;
      const isInactive = cat.isActive === false;

      const matchesStatus = statusFilter === 'all' ? true : statusFilter === 'active' ? isActive : isInactive;

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  const handleEdit = (FeedbackCategoryId: string) => {
    router.push(`/feedbacks/edit-feedback-category/${FeedbackCategoryId}`);
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const page = 1;
      const limit = 100; // Fetch all (or reasonable max) for client-side sorting/pagination
      const res = await getAllFeedbackCategories(page, limit);

      if (res?.payload.categories) {
        setCategories(res.payload.categories); // Access the categories array from the API response
      }
    } catch (error) {
      console.error('Failed to fetch feedback categories', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'sno',
      label: 'S.No.',
      render: (_item: unknown, index: number) => startIndex + index + 1,
    },
    { key: 'categoryName', label: 'Category Name', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item: FeedbackCategoryType) =>
        item.isActive ? (
          <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            Active
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
            Inactive
          </span>
        ),
    },
    { key: 'createdAt', label: 'Created At', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: FeedbackCategoryType) => (
        <div className="mr-2 flex justify-end gap-2">
          <FilePenLine
            className="text-primary w-5 cursor-pointer"
            onClick={() => handleEdit(item.id)}
          />
          <Trash2
            className="text-primary w-5 cursor-pointer"
            onClick={() => handleDelete(item.id)}
          />
        </div>
      ),
    }

  ];

  const handleDelete = (id: string) => {
    console.log('Delete ID:', id);
    // Implement delete functionality here, likely using a confirmation modal
  };

  // Sorting Logic
  const sortedCategories = React.useMemo(() => {
    if (!sortConfig.key) return filteredCategories;

    return [...filteredCategories].sort((a, b) => {
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
  }, [filteredCategories, sortConfig]);

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
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCategories = sortedCategories.slice(startIndex, startIndex + itemsPerPage);

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

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="bg-sidebar w-full overflow-y-auto rounded p-4 shadow-lg">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <p className="text-md font-semibold">Feedback Category</p>

          <Link href="/feedbacks/add-feedback-category">
            <Button className="bg-primary text-background flex cursor-pointer items-center gap-2">
              <Plus className="h-4 w-4" />
              Add category
            </Button>
          </Link>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative my-4 w-full sm:w-1/3">
            <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border py-2 pr-10 pl-3 text-sm focus:outline-none focus:border-primary"
            />
          </div>
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
                      className="w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
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
          data={currentCategories}
          // loading={loading}
          emptyMessage="No feedback categories found."
          sortConfig={sortConfig}
          onSort={handleSort}
        />

        {/* Pagination */}
        {categories.length > 0 && (
          <div className="mt-6 flex justify-end">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e: React.MouseEvent) => {
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
                        onClick={(e: React.MouseEvent) => {
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
                    onClick={(e: React.MouseEvent) => {
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
}
