'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, FilePenLine, Trash2 } from 'lucide-react';
import CommonTable from '@/components/v1/common/common-table/common-table';
import { Column } from '@/interface/common.interface';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { getBanner } from '@/apis/create-banners.api';
import { BannerGroup, FlattenedBanner } from '@/interface/common.interface';

export default function BannerList() {
  // ✅ Type definitions based on your API response
  type Banner = {
    id: string;
    title: string;
    tag: string;
    priority: number;
    bannerUrl: string;
    description: string;
    imageUrlSmall: string;
    imageUrlMedium: string;
    imageUrlLarge: string;
  };

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Fetch and reshape data from API
  const fetchBanners = async (): Promise<void> => {
  try {
    setLoading(true);
    const response = await getBanner(); // typed as BannerApiResponse

    if (response.error) {
      toast.error(response.message || 'Failed to fetch banners');
      return;
    }

    const groups: BannerGroup[] = response.payload.payload.banners;

    const flatList: FlattenedBanner[] = groups.flatMap((group) =>
      group.banners.map((b) => ({
        id: b.id,
        title: b.title,
        tag: group.tag,
        priority: b.priority,
        bannerUrl: b.bannerUrl,
        description: b.description,
        imageUrlSmall: b.images.small,
        imageUrlMedium: b.images.medium,
        imageUrlLarge: b.images.large,
      }))
    );

    setBanners(flatList);
  } catch (error) {
    console.error('Fetch banners error:', error);
    toast.error('Something went wrong while fetching banners');
  } finally {
    setLoading(false);
  }
};



  // ✅ Fetch on component mount
  useEffect(() => {
    fetchBanners();
  }, []);

  // ✅ Table columns
  const columns: Column<Banner>[] = [
    {
      key: 'sno',
      label: 'S.No',
      render: (_item, index) => index + 1,
    },
    {
      key: 'imageUrlSmall',
      label: 'Image',
      render: (item) => (
        <Image
          width={1000}
          height={1000}
          src={item.imageUrlSmall || '/placeholder.jpg'}
          alt={item.title}
          className="h-12 w-12 rounded-md border object-cover"
          priority
        />
      ),
    },
    { key: 'title', label: 'Title' },
    { key: 'tag', label: 'Tag' },
    { key: 'priority', label: 'Priority' },
    {
      key: 'bannerUrl',
      label: 'Banner URL',
      render: (item) => (
        <a
          href={item.bannerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          Visit
        </a>
      ),
    },
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

        {/* Table */}
        {loading ? (
          <p className="text-center text-gray-500">Loading banners...</p>
        ) : (
          <CommonTable<Banner> columns={columns} data={banners} emptyMessage="No banners found." />
        )}
      </div>
    </div>
  );
}
