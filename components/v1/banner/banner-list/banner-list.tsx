'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, FilePenLine, Trash2 } from 'lucide-react';
import CommonTable from '@/components/v1/common/common-table/common-table';
import { Column } from '@/interface/common.interface'; // Import shared Column interface
import Image from 'next/image';

export default function BannerList() {
  // Banner type definition
  type Banner = {
    id: number;
    image: string;
    tag: string;
    createdAt: string;
  };

  // Example banner data
  const banners: Banner[] = [
    {
      id: 1,
      image: '/placeholder.jpg',
      tag: 'Home Banner',
      createdAt: '2025-10-06',
    },
    {
      id: 2,
      image: '/placeholder.jpg',
      tag: 'Offer Banner',
      createdAt: '2025-10-05',
    },
  ];

  // Columns for CommonTable with Banner type
  const columns: Column<Banner>[] = [
    {
      key: 'sno',
      label: 'S.No',
      render: (_item, index) => index + 1,
    },
    {
      key: 'image',
      label: 'Image',
      render: (item) => (
        <Image
          width={1000}
          height={1000}
          src={item.image}
          alt="banner"
          className="h-12 w-12 rounded-md border object-cover"
        />
      ),
    },
    { key: 'tag', label: 'Tag' },
    { key: 'createdAt', label: 'Created At' },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex justify-end gap-2">
          <FilePenLine className="text-primary w-5 cursor-pointer" />
          <Trash2 className="text-primary w-5 cursor-pointer" />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-sidebar flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="w-full overflow-y-auto rounded-lg p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Banner List</p>
          <Link href="/banner/create-banner">
            <Button className="bg-primary flex cursor-pointer items-center gap-2">
              <Plus className="h-4 w-4" /> Add Banner
            </Button>
          </Link>
        </div>

        {/* Common Table with type passed explicitly */}
        <CommonTable<Banner> columns={columns} data={banners} emptyMessage="No banners found." />
      </div>
    </div>
  );
}
