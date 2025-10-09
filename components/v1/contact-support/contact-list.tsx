"use client";

import React from "react";
import { useContactSupportStore } from "@/store/contactSupportStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import CommonTable from "@/components/v1/common/common-table/common-table";
import type { Column, Contact } from "@/interface/common.interface"; // adjust the path if needed


export default function ContactSupportList() {
  const contacts = useContactSupportStore((state) => state.contacts);
  const router = useRouter();

  // 2. Strongly type the columns
  const columns: Column<Contact>[] = [
    {
      key: "sno",
      label: "S.No",
      render: (_item, index) => index + 1,
    },
    { key: "id", label: "ID" },
    { key: "title", label: "Title" },
    {
      key: "createdAt",
      label: "Created At",
      render: (item) => new Date(item.createdAt).toLocaleString(),
    },
    {
      key: "updatedAt",
      label: "Updated At",
      render: (item) => new Date(item.updatedAt).toLocaleString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            onClick={() => router.push(`/contact-support/edit/${item.id}`)}
          >
            Edit
          </Button>
          <Button size="sm" variant="destructive">
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="w-full max-h-[89vh] overflow-y-auto rounded-lg bg-sidebar p-4 shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-md font-semibold">Contact & Support List</p>
          <Link
            href="/contact-support/contact-create"
            className="flex cursor-pointer rounded bg-primary text-background px-3 py-2 text-sm transition"
          >
            <Plus className="mr-2 h-5 w-5" /> Add Contact
          </Link>
        </div>

        {/* Table */}
        <CommonTable<Contact>
          columns={columns}
          data={contacts}
          emptyMessage="No contacts found."
        />
      </div>
    </div>
  );
}
