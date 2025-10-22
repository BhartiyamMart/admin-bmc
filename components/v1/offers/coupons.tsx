"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FilePenLine, Trash2 } from "lucide-react";
import CommonTable from "@/components/v1/common/common-table/common-table";

// -------------------
// Coupon Type
// -------------------
interface Coupon {
  id: string;
  code: string;
  title: string;
  discountValue: number;
  type: "PERCENT" | "FLAT";
  status: boolean;
  validFrom: string;
  validUntil?: string;
  expiryType: "FIXED" | "RELATIVE";
  relativeDays?: number;
}

// -------------------
// Dummy Data
// -------------------
const dummyCoupons: Coupon[] = [
  {
    id: "1",
    code: "SUMMER20",
    title: "Summer Sale",
    discountValue: 20,
    type: "PERCENT",
    status: true,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    expiryType: "FIXED",
  },
  {
    id: "2",
    code: "FLAT50",
    title: "Flat Discount",
    discountValue: 50,
    type: "FLAT",
    status: false,
    validFrom: new Date().toISOString(),
    expiryType: "RELATIVE",
    relativeDays: 10,
  },
  {
    id: "3",
    code: "BOGO1",
    title: "Buy 1 Get 1",
    discountValue: 1,
    type: "FLAT",
    status: true,
    validFrom: new Date().toISOString(),
    expiryType: "RELATIVE",
    relativeDays: 5,
  },
];

// -------------------
// CouponList Component
// -------------------
const CouponList: React.FC = () => {
  const coupons = dummyCoupons;

  const columns = [
    {
      key: "sno",
      label: "S.No",
      render: (_: Coupon, index: number) => index + 1,
    },
    { key: "code", label: "Code" },
    { key: "title", label: "Title" },
    {
      key: "discount",
      label: "Discount",
      render: (item: Coupon) =>
        `${item.discountValue}${item.type === "PERCENT" ? "%" : "₹"}`,
    },
    {
      key: "status",
      label: "Status",
      render: (item: Coupon) =>
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
      key: "validFrom",
      label: "Valid From",
      render: (item: Coupon) => new Date(item.validFrom).toLocaleDateString(),
    },
    {
      key: "validUntil",
      label: "Valid Until / Relative",
      render: (item: Coupon) =>
        item.expiryType === "FIXED"
          ? item.validUntil
            ? new Date(item.validUntil).toLocaleDateString()
            : "-"
          : `${item.relativeDays} days`,
    },
    {
      key: "actions",
      label: "Action",
      render: (item: Coupon) => (
        <div className="flex justify-end gap-2">
          <FilePenLine
            className="cursor-pointer w-5 text-blue-600"
            onClick={() => console.log("Edit:", item.id)}
          />
          <Trash2
            className="cursor-pointer w-5 text-red-600"
            onClick={() => console.log("Delete:", item.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="w-full overflow-y-auto rounded-lg bg-sidebar p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between">
          <p className="text-md font-semibold">Coupons</p>
          <Link href="add-coupon">
            <Button className="bg-primary text-background flex items-center cursor-pointer gap-2">
              <Plus className="w-4 h-4" /> Add Coupon
            </Button> 
          </Link> 
        </div>

         <div className="min-w-[300px] w-full sm:w-[560px]  md:w-[640px] lg:w-[900px] xl:w-[1100px]  min-w-full">
        {/* Table */}
        <CommonTable<Coupon>
          columns={columns}
          data={coupons}
          emptyMessage="No coupons found."
        />
      </div>
      </div>
    </div>
  );
};

export default CouponList;
