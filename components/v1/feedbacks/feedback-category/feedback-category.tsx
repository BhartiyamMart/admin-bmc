'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Eye, XCircle, Plus } from "lucide-react";
import CommonTable from "@/components/v1/common/common-table/common-table"; // adjust path if needed

export default function FeedbackCategory() {
  const [feedbackCategory, setFeedbackCategory] = useState([
    {
      id: 1,
      name: 'Anand',
      status: 'active',
      createdAt: '04 oct 2025',
    },
  ]);

  const columns = [
    { key: 'sno', label: 'S.No', render: (_item: any, index: number) => index + 1 },
    { key: 'name', label: 'Category Name' },
    {
      key: 'status',
      label: 'Status',
      render: (item: any) => (
        item.status === 'active' ? (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
            Inactive
          </span>
        )
      )
    },
    { key: 'createdAt', label: 'Created At' },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex justify-end gap-2">
          <XCircle className="w-5 cursor-pointer text-primary hover:text-primary" />
          <Eye className="w-5 cursor-pointer text-primary hover:text-primary" />
          <CheckCircle className="mr-2 w-5 cursor-pointer text-primary hover:text-primary" />
        </div>
      )
    },
  ];

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="w-full max-h-[89vh] overflow-y-auto rounded-lg bg-sidebar p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Feedback Category</p>
          <Link href="/feedbacks/add-feedback-category">
            <Button className="bg-primary text-background flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add category
            </Button>
          </Link>
        </div>

        {/* Table */} 
        <CommonTable
          columns={columns}
          data={feedbackCategory}
          emptyMessage="No feedback categories found."
        />
      </div>
    </div>
  );
}
