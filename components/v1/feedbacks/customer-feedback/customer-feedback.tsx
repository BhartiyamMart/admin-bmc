'use client';

import React from 'react';
import { CheckCircle, Eye, XCircle } from 'lucide-react';
import CommonTable from '@/components/v1/common/common-table/common-table'; // adjust the path if needed

export default function CustomerFeedback() {
  const customerFeedback = [
    {
      id: 1,
      name: '',
      customerName: '',
      rating: '',
      createdAt: '',
    },
  ];

  const columns = [
    { key: 'sno', label: 'S.No.', render: (_item: unknown, index: number) => index + 1 },
    { key: 'name', label: 'Name' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'rating', label: 'Rating' },
    { key: 'createdAt', label: 'Created At' },
  ];

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="bg-sidebar w-full rounded p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-md font-semibold">Customer Feedback</p>
        </div>

        <div className="w-full min-w-[300px] min-w-full sm:w-[560px] md:w-[640px] lg:w-[900px] xl:w-[1100px]">
          {/* Table */}
          <CommonTable columns={columns} data={customerFeedback} emptyMessage="No customer feedback found." />
        </div>
      </div>
    </div>
  );
}
