'use client';

import React, { useState } from 'react';
import { CheckCircle, Eye, XCircle } from 'lucide-react';
import CommonTable from '@/components/v1/common/common-table/common-table'; // adjust the path if needed

export default function CustomerFeedback() {
  const [customerFeedback, setCustomerFeedback] = useState([
    {
      id: 1,
      name: 'Anand',
      customerName: 'Anand Hindustanii', 
      rating: 1,
      createdAt: '04 oct 2025',
    },
  ]);

  const columns = [
    { key: 'sno', label: 'S.No', render: (_item: any, index: number) => index + 1 },
    { key: 'name', label: 'Name' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'rating', label: 'Rating' },
    { key: 'createdAt', label: 'Created At' },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex justify-end gap-2">
          <XCircle className="w-5 cursor-pointer text-primary" />
          <Eye className="w-5 cursor-pointer text-primary" />
          <CheckCircle className="mr-2 w-5 cursor-pointer text-primary" />
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center  p-4">
      <div className="w-full rounded-lg bg-sidebar p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-md font-semibold">Customer Feedback</p>
        </div>

        <div className="min-w-[300px] w-full sm:w-[560px]  md:w-[640px] lg:w-[900px] xl:w-[1100px]  min-w-full">
        {/* Table */}
        <CommonTable
          columns={columns}
          data={customerFeedback}
          emptyMessage="No customer feedback found."
        />
      </div>
      </div>
    </div>
  );
}
