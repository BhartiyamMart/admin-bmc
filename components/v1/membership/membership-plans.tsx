"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FilePenLine, Trash2 } from "lucide-react";
import CommonTable from "@/components/v1/common/common-table/common-table";

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
    name: "Basic Plan",
    status: true,
    createdAt: "2025-10-01",
    updatedAt: "2025-10-05",
  },
  {
    id: 2,
    name: "Premium Plan",
    status: false,
    createdAt: "2025-10-02",
    updatedAt: "2025-10-06",
  },
];

// -------------------
// Component
// -------------------
const MembershipPlansList: React.FC = () => {
  const membershipPlans = dummyPlans;

  const columns = [
    {
      key: "sno",
      label: "S.No",
      render: (_item: MembershipPlan, index: number) => index + 1,
    },
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    {
      key: "status",
      label: "Status",
      render: (item: MembershipPlan) =>
        item.status ? (
          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            Active
          </span>
        ) : (
          <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
            Inactive
          </span>
        ),
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (item: MembershipPlan) =>
        new Date(item.createdAt).toLocaleDateString(),
    },
    {
      key: "updatedAt",
      label: "Updated At",
      render: (item: MembershipPlan) =>
        new Date(item.updatedAt).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_item: MembershipPlan) => (
        <div className="flex justify-end gap-2">
          <FilePenLine className="cursor-pointer w-5 text-primary" />
          <Trash2 className="cursor-pointer w-5 text-primary" />
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="w-full max-h-[89vh] overflow-y-auto rounded-lg bg-sidebar p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between">
          <p className="text-md font-semibold">Membership Plans</p>
          <Link href="add-membership-plans">
            <Button className="bg-primary text-background flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Membership
            </Button>
          </Link>
        </div>

        {/* Table */}
        <CommonTable<MembershipPlan>
          columns={columns}
          data={membershipPlans}
          emptyMessage="No membership plans found."
        />
      </div>
    </div>
  );
};

export default MembershipPlansList;
