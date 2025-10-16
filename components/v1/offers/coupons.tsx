"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FilePenLine, Trash2 } from "lucide-react";
import CommonTable from "@/components/v1/common/common-table/common-table";
import { useCouponStore } from "@/store/couponStore";

const CouponList = () => {
  const coupons = useCouponStore((state) => state.coupons);

  const columns = [
    { key: "code", label: "Code" },
    { key: "title", label: "Title" },
    {
      key: "discount",
      label: "Discount",
      render: (item: any) =>
        `${item.discountValue}${item.type === "PERCENT" ? "%" : "₹"}`,
    },
    { key: "status", label: "Status" },
    {
      key: "validFrom",
      label: "Valid From",
      render: (item: any) => new Date(item.validFrom).toLocaleDateString(),
    },
    {
      key: "validUntil",
      label: "Valid Until / Relative",
      render: (item: any) =>
        item.expiryType === "FIXED"
          ? item.validUntil
            ? new Date(item.validUntil).toLocaleDateString()
            : "-"
          : `${item.relativeDays} days`,
    },
    {
      key: "actions",
      label: "Action",
      render: (item: any) => (
        <div className="flex justify-end gap-2">
          <FilePenLine className="cursor-pointer w-5 text-blue-600" />
          <Trash2 className="cursor-pointer w-5 text-red-600" />
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="w-full max-h-[89vh] overflow-y-auto rounded-lg bg-sidebar p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between">
          <p className="text-md font-semibold">Coupons</p>
          <Link href="add-coupon">
            <Button className="bg-primary text-background flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Coupon
            </Button> 
          </Link>
        </div>

        {/* Table */}
        <CommonTable
          columns={columns}
          data={coupons}
          emptyMessage="No coupons found." 
        />
      </div>
    </div>
  );
};

export default CouponList;
