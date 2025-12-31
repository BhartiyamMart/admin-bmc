'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, FilePenLine, Trash2 } from 'lucide-react';
import CommonTable from '@/components/v1/common/common-table/common-table';

// -------------------
// MembershipPlan Type
// -------------------
interface MembershipPlan {
  id: number;
  name: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

// -------------------
// Dummy Data
// -------------------
const dummyPlans: MembershipPlan[] = [
  {
    id: 1,
    name: 'Basic Plan',
    status: true,
    createdAt: '2025-10-01',
    updatedAt: '2025-10-05',
  },
  {
    id: 2,
    name: 'Premium Plan',
    status: false,
    createdAt: '2025-10-02',
    updatedAt: '2025-10-06',
  },
];

// -------------------
// Component
// -------------------
const MembershipPlansList: React.FC = () => {
  const membershipPlans = dummyPlans;

  const columns = [
    {
      key: 'sno',
      label: 'S.No',
      render: (_item: MembershipPlan, index: number) => index + 1,
    },
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    {
      key: 'status',
      label: 'Status',
      render: (item: MembershipPlan) =>
        item.status ? (
          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Active</span>
        ) : (
          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Inactive</span>
        ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (item: MembershipPlan) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      key: 'updatedAt',
      label: 'Updated At',
      render: (item: MembershipPlan) => new Date(item.updatedAt).toLocaleDateString(),
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
          <p className="text-md font-semibold">Membership Plans</p>
          <Link href="add-membership-plans">
            <Button className="bg-primary text-background flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Membership
            </Button>
          </Link>
        </div>

        <div className="w-full min-w-[300px] min-w-full sm:w-[560px] md:w-[640px] lg:w-[900px] xl:w-[1100px]">
          {/* Table */}
          <CommonTable<MembershipPlan>
            columns={columns}
            data={membershipPlans}
            emptyMessage="No membership plans found."
          />
        </div>
      </div>
    </div>
  );
};

export default MembershipPlansList;
