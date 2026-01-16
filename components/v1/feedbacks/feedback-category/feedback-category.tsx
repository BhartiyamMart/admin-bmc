'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trash2, FilePenLine, Plus } from 'lucide-react';
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
    if (!sortConfig.key) return categories;

    return [...categories].sort((a, b) => {
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
  }, [categories, sortConfig]);

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
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="bg-sidebar w-full overflow-y-auto rounded p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Feedback Category</p>

          <Link href="/feedbacks/add-feedback-category">
            <Button className="bg-primary text-background flex cursor-pointer items-center gap-2">
              <Plus className="h-4 w-4" />
              Add category
            </Button>
          </Link>
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
        {totalPages > 1 && (
          <div className="mt-6 flex justify-end gap-2">
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
  );
}
