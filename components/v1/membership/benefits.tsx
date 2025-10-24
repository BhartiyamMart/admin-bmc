"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FilePenLine, Trash2 } from "lucide-react";
import CommonTable from "@/components/v1/common/common-table/common-table";

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
  { id: 1, createdAt: "2025-10-06" },
  { id: 2, createdAt: "2025-10-05" },
  { id: 3, createdAt: "2025-10-07" },
];

// -------------------
// Component
// -------------------
const BenefitList: React.FC = () => {
  const benefits = dummyBenefits;

  const columns = [
    {
      key: "sno",
      label: "S.No",
      render: (_item: Benefit, index: number) => index + 1,
    },
    { key: "id", label: "ID" },
    {
      key: "createdAt",
      label: "Created At",
      render: (item: Benefit) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: Benefit) => (
        <div className="flex justify-end gap-2">
          <FilePenLine className="cursor-pointer w-5 text-primary" />
          <Trash2 className="cursor-pointer w-5 text-primary" />
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="w-full overflow-y-auto rounded-lg bg-sidebar p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between">
          <p className="text-md font-semibold">Benefits</p>
          <Link href="add-benefits">
            <Button className="bg-primary text-background flex items-center gap-2 cursor-pointer">
              <Plus className="w-4 h-4" /> Add Benefit
            </Button>
          </Link>
        </div>
        <div className="min-w-[300px] w-full sm:w-[560px]  md:w-[640px] lg:w-[900px] xl:w-[1100px]  min-w-full">
        {/* Table */}
        <CommonTable<Benefit>
          columns={columns}
          data={benefits}
          emptyMessage="No benefits found." 
        />
      </div>
      </div>
    </div>
  );
};

export default BenefitList;
