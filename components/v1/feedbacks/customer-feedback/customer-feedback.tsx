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
          <XCircle className="w-5 cursor-pointer text-red-600 hover:text-red-800" />
          <Eye className="w-5 cursor-pointer text-green-600 hover:text-green-800" />
          <CheckCircle className="mr-2 w-5 cursor-pointer text-blue-500 hover:text-blue-700" />
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen justify-center  p-4">
      <div className="w-full rounded-lg bg-sidebar p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-md font-semibold">Customer Feedback</p>
        </div>

        {/* Table */}
        <CommonTable
          columns={columns}
          data={customerFeedback}
          emptyMessage="No customer feedback found."
        />
      </div>
    </div>
  );
}
