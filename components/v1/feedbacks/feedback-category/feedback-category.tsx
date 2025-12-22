'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Eye, XCircle, Plus } from 'lucide-react';
import CommonTable from '@/components/v1/common/common-table/common-table'; // adjust path if needed

interface FeedbackCategoryType {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function FeedbackCategory() {
  const feedbackCategory: FeedbackCategoryType[] = [
    {
      id: 1,
      name: 'Anand',
      status: 'active',
      createdAt: '04 oct 2025',
    },
  ];

  const columns = [
    { key: 'sno', label: 'S.No', render: (_item: unknown, index: number) => index + 1 },
    { key: 'name', label: 'Category Name' },
    {
      key: 'status',
      label: 'Status',
      render: (item: FeedbackCategoryType) =>
        item.status === 'active' ? (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
            Inactive
          </span>
        ),
    },
    { key: 'createdAt', label: 'Created At' },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex justify-end gap-2">
          <XCircle className="text-primary hover:text-primary w-5 cursor-pointer" />
          <Eye className="text-primary hover:text-primary w-5 cursor-pointer" />
          <CheckCircle className="text-primary hover:text-primary mr-2 w-5 cursor-pointer" />
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="bg-sidebar w-full overflow-y-auto rounded p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Feedback Category</p>
          <Link href="/feedbacks/add-feedback-category">
            <Button className="bg-primary text-background flex cursor-pointer items-center gap-2">
              <Plus className="h-4 w-4" /> Add category
            </Button>
          </Link>
        </div>

        <div className="w-full min-w-[300px] min-w-full sm:w-[560px] md:w-[640px] lg:w-[900px] xl:w-[1100px]">
          {/* Table */}
          <CommonTable columns={columns} data={feedbackCategory} emptyMessage="No feedback categories found." />
        </div>
      </div>
    </div>
  );
}
