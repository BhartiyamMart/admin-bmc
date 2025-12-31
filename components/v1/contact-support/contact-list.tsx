'use client';

import React from 'react';
import { useContactSupportStore } from '@/store/contactSupportStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import CommonTable from '@/components/v1/common/common-table/common-table';
import type { Column, ContactTable } from '@/interface/common.interface';

export default function ContactSupportList() {
  const contacts = useContactSupportStore((state) => state.contacts);
  const router = useRouter();

  // Convert ContactSupport[] → Contact[]
  const contactList: ContactTable[] = contacts.map((c) => ({
    id: c.id,
    title: c.title,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));

  const columns: Column<ContactTable>[] = [
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
        <div className="mr-2 flex justify-end gap-2">
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
    <div className="foreground flex justify-center p-4">
      <div className="bg-sidebar w-full rounded p-4 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-md font-semibold">Contact & Support List</p>
          <Link
            href="/contact-support/contact-create"
            className="bg-primary text-background flex cursor-pointer rounded px-3 py-2 text-sm transition"
          >
            <Plus className="mr-2 h-5 w-5" /> Add Contact
          </Link>
        </div>

        <CommonTable<ContactTable> columns={columns} data={contactList} emptyMessage="No contacts found." />
      </div>
    </div>
  );
}
