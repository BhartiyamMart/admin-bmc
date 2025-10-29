'use client';

import React from 'react';
import { useContactSupportStore } from '@/store/contactSupportStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import CommonTable from '@/components/v1/common/common-table/common-table';
import type { Column, Contact } from '@/interface/common.interface'; // adjust the path if needed

export default function ContactSupportList() {
  const contacts = useContactSupportStore((state) => state.contacts);
  const router = useRouter();

  // 2. Strongly type the columns
  const columns: Column<Contact>[] = [
    {
      key: 'sno',
      label: 'S.No',
      render: (_item, index) => index + 1,
    },
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (item) => new Date(item.createdAt).toLocaleString(),
    },
    {
      key: 'updatedAt',
      label: 'Updated At',
      render: (item) => new Date(item.updatedAt).toLocaleString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" onClick={() => router.push(`/contact-support/edit/${item.id}`)}>
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
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="bg-sidebar w-full overflow-y-auto rounded-lg p-4 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-md font-semibold">Contact & Support List</p>
          <Link
            href="/contact-support/contact-create"
            className="bg-primary text-background flex cursor-pointer rounded px-3 py-2 text-sm transition"
          >
            <Plus className="mr-2 h-5 w-5" /> Add Contact
          </Link>
        </div>
        <div className="w-full min-w-[300px] min-w-full sm:w-[560px] md:w-[640px] lg:w-[900px] xl:w-[1100px]">
          {/* Table */}
          <CommonTable<Contact> columns={columns} data={contacts} emptyMessage="No contacts found." />
        </div>
      </div>
    </div>
  );
}
