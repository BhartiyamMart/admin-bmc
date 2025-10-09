"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FilePenLine, Trash2 } from "lucide-react";
import CommonTable from "@/components/v1/common/common-table/common-table";

function BenefitList() {
  const benefits = [
    {
      id: 1,
      createdAt: "2025-10-06",
    },
    {
      id: 2,
      createdAt: "2025-10-05",
    },
  ];

  // Define columns for CommonTable
  const columns = [
    {
      key: "sno",
      label: "S.No",
      render: (_item: any, index: number) => index + 1,
    },
    { key: "id", label: "ID" },
    {
      key: "createdAt",
      label: "Created At",
      render: (item: any) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: any) => (
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
          <p className="text-md font-semibold">Benefits</p>
          <Link href="add-benefits">
            <Button className="bg-primary text-background flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Benefit
            </Button>
          </Link>
        </div>

        {/* Table */}
        <CommonTable columns={columns} data={benefits} emptyMessage="No benefits found." />
      </div>
    </div>
  );
}

export default BenefitList;
