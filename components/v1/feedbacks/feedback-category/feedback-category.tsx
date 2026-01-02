'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Eye, XCircle, Plus } from 'lucide-react';
import CommonTable from '@/components/v1/common/common-table/common-table';
import { getAllFeedbackCategories } from '@/apis/create-time-slot.api';

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
  const [categories, setCategories] = useState<FeedbackCategoryType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const page = 1;
      const limit = 10;
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
      render: (_item: unknown, index: number) => index + 1,
    },
    { key: 'categoryName', label: 'Category Name' },
    {
      key: 'status',
      label: 'Status',
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
    { key: 'createdAt', label: 'Created At' },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="mr-2 flex justify-end gap-2">
          <XCircle className="text-primary hover:text-primary w-5 cursor-pointer" />
          <Eye className="text-primary hover:text-primary w-5 cursor-pointer" />
          <CheckCircle className="text-primary hover:text-primary mr-2 w-5 cursor-pointer" />
        </div>
      ),
    },
  ];

  const handleDelete = (id: string) => {
    console.log('Delete ID:', id);
    // Implement delete functionality here, likely using a confirmation modal
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
          data={categories}
          // loading={loading}
          emptyMessage="No feedback categories found."
        />
      </div>
    </div>
  );
}
