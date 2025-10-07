"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FilePenLine, Trash2 } from "lucide-react";
import CommonTable from "@/components/v1/common/common-table/common-table";

export default function BannerList() {
  const [banners, setBanners] = useState([
    {
      id: 1,
      image: "/placeholder.jpg", // Example image
      tag: "Home Banner",
      createdAt: "2025-10-06",
    },
    {
      id: 2,
      image: "/placeholder.jpg",
      tag: "Offer Banner",
      createdAt: "2025-10-05",
    },
  ]);

  // Define columns for CommonTable
  const columns = [
    {
      key: "sno",
      label: "S.No",
      render: (_item: any, index: number) => index + 1,
    },
    {
      key: "image",
      label: "Image",
      render: (item: any) => (
        <img
          src={item.image}
          alt="banner"
          className="h-12 w-12 rounded-md border object-cover"
        />
      ),
    },
    { key: "tag", label: "Tag" },
    { key: "createdAt", label: "Created At" },
    {
      key: "actions",
      label: "Actions",
      render: (item: any) => (
        <div className="flex justify-end gap-2">
          <FilePenLine className="w-5 cursor-pointer text-blue-600 hover:text-blue-800" />
          <Trash2 className="w-5 cursor-pointer text-red-600 hover:text-red-800" />
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen justify-center bg-gray-100 p-4">
      <div className="w-full max-h-[89vh] overflow-y-auto rounded-lg bg-white p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Banner List</p>
          <Link href="/banner/create-banner">
            <Button className="flex items-center gap-2 bg-primary"> 
              <Plus className="h-4 w-4" /> Add Banner
            </Button>
          </Link>
        </div>

        {/* Common Table with Pagination */}  
        <CommonTable
          columns={columns}
          data={banners}
          emptyMessage="No banners found." 
        />
      </div>
    </div>
  );
}
