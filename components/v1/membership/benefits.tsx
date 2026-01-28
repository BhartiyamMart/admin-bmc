'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, FilePenLine, Trash2 } from 'lucide-react';
import CommonTable from '@/components/common/common-table/common-table';

// -------------------
// Benefit Type
// -------------------
interface Benefit {
  id: number;
  createdAt: string;
}

// -------------------
// Dummy Data
// -------------------
const dummyBenefits: Benefit[] = [
  { id: 1, createdAt: '2025-10-06' },
  { id: 2, createdAt: '2025-10-05' },
  { id: 3, createdAt: '2025-10-07' },
];

// -------------------
// Component
// -------------------
const BenefitList: React.FC = () => {
  const benefits = dummyBenefits;

  const columns = [
    {
      key: 'sno',
      label: 'S.No',
      render: (_item: Benefit, index: number) => index + 1,
    },
    { key: 'id', label: 'ID' },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (item: Benefit) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="mr-2 flex justify-end gap-2">
          <FilePenLine className="text-primary w-5 cursor-pointer" />
          <Trash2 className="text-primary w-5 cursor-pointer" />
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="bg-sidebar w-full overflow-y-auto rounded p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between">
          <p className="text-md font-semibold">Benefits</p>
          <Link href="add-benefits">
            <Button className="bg-primary text-background flex cursor-pointer items-center gap-2">
              <Plus className="h-4 w-4" /> Add Benefit
            </Button>
          </Link>
        </div>
        <div className="w-full min-w-[300px] min-w-full sm:w-[560px] md:w-[640px] lg:w-[900px] xl:w-[1100px]">
          {/* Table */}
          <CommonTable<Benefit> columns={columns} data={benefits} emptyMessage="No benefits found." />
        </div>
      </div>
    </div>
  );
};

export default BenefitList;
