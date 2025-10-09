"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FilePenLine, Trash2 } from "lucide-react";
import CommonTable from "@/components/v1/common/common-table/common-table";
import { useOfferStore } from "@/store/offerStore";

const OfferList = () => {
  const offers = useOfferStore((state) => state.offers); 

  const columns = [
    {
      key: "storeId",
      label: "Store",
    },
    {
      key: "title",
      label: "Title",
    },
    {
      key: "type",
      label: "Type",
    },
    {
      key: "discount",
      label: "Discount",
      render: (item: any) => `${item.discountValue} ${item.discountUnit}`,
    },
    {
      key: "status",
      label: "Status",
      render: (item: any) =>
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
      key: "startDateTime",
      label: "Start",
      render: (item: any) => new Date(item.startDateTime).toLocaleString(),
    },
    {
      key: "endDateTime",
      label: "End",
      render: (item: any) => new Date(item.endDateTime).toLocaleString(),
    },
    {
      key: "actions",
      label: "Action",
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
          <p className="text-md font-semibold">Offers</p>
          <Link href="/offers/add-offers">
            <Button className="bg-primary text-background flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Offer
            </Button>
          </Link>
        </div>

        {/* Table */}
        <CommonTable columns={columns} data={offers} emptyMessage="No offers found." />
      </div>
    </div>
  );
};

export default OfferList;
