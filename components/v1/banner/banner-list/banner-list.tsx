'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, FilePenLine, Trash2 } from 'lucide-react';
import CommonTable from '@/components/v1/common/common-table/common-table';
import { BannerApiResponse, Column } from '@/interface/common.interface';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { deleteBanner, getBanner } from '@/apis/create-banners.api';
import { BannerGroup, FlattenedBanner } from '@/interface/common.interface';
import { useRouter } from 'next/navigation';

export default function BannerList() {
  const router = useRouter();

  const [banners, setBanners] = useState<FlattenedBanner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [SelectedBannerId, setSelectedBannerId] = useState<string | null>(null);
  const [permanentDelete, setPermanentDelete] = useState(false);

  const handleEdit = (bannerId: string) => {
    router.push(`/banner/edit-banner/${bannerId}`);
  };

  const handleDelete = (bannerId: string) => {
    setSelectedBannerId(bannerId);
    setPermanentDelete(false);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!SelectedBannerId) return;

    try {
      const response = await deleteBanner(SelectedBannerId, permanentDelete);
      if (!response || response.error) {
        toast.error(response?.message || 'Failed to delete banner');
      } else {
        toast.success('Banner deleted successfully');
        fetchBanners(); // Refresh the list after deletion
      }
    } catch (error) {
      console.error('Delete Banner failed:', error);
      toast.error('Failed to delete Banner');
    } finally {
      setIsDialogOpen(false);
      setSelectedBannerId(null);
      setPermanentDelete(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setSelectedBannerId(null);
    setPermanentDelete(false);
  };

  const fetchBanners = async (): Promise<void> => {
    try {
      setLoading(true);
      const response: BannerApiResponse = await getBanner();

      console.log('API Response:', response);

      if (response.error) {
        toast.error(response.message || 'Failed to fetch banners');
        return;
      }

      // Now response.payload.banners will work correctly
      if (response.payload && response.payload.banners) {
        const groups: BannerGroup[] = response.payload.banners;

        const flatList: FlattenedBanner[] = groups.flatMap((group) =>
          group.banners.map((b) => ({
            id: b.id,
            title: b.title,
            tag: group.tag,
            priority: b.priority,
            bannerUrl: b.bannerUrl,
            description: b.description,
            imageUrlSmall: b.images.small,
            imageUrlMedium: b.images.medium || null,
            imageUrlLarge: b.images.large,
          }))
        );

        setBanners(flatList);
      } else {
        toast.error('No banner data found');
      }
    } catch (error) {
      console.error('Fetch banners error:', error);
      toast.error('Something went wrong while fetching banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const columns: Column<FlattenedBanner>[] = [
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
        <a href={item.bannerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
          Visit
        </a>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item) => (
        <div className="flex justify-end gap-2">
          <FilePenLine
            className="text-primary hover:text-primary/80 w-5 cursor-pointer transition-colors"
            onClick={() => handleEdit(item.id)}
          />
          <Trash2
            className="w-5 cursor-pointer text-red-500 transition-colors hover:text-red-600"
            onClick={() => handleDelete(item.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-sidebar flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="w-full overflow-y-auto rounded-lg p-4 shadow-lg">
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Banner List</p>
          <Link href="/banner/create-banner">
            <Button className="bg-primary flex cursor-pointer items-center gap-2">
              <Plus className="h-4 w-4" /> Add Banner
            </Button>
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading banners...</p>
        ) : (
          <CommonTable<FlattenedBanner> columns={columns} data={banners} emptyMessage="No banners found." />
        )}
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCancelDelete} aria-hidden="true" />
          <div className="relative z-10 w-11/12 max-w-md rounded-md bg-white p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold">Delete Banner</h3>
            <p className="mb-4 text-sm text-gray-700">Are you sure you want to delete this Banner?</p>
            <div>
              <label className="mb-4 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={permanentDelete}
                  onChange={(e) => setPermanentDelete(e.target.checked)}
                  className="text-foreground h-4 w-4 cursor-pointer rounded border-gray-300"
                />
                <span className="text-xs">Permanent delete</span>
              </label>

              <div className="flex justify-end gap-3">
                <button onClick={handleCancelDelete} className="cursor-pointer rounded-md border px-4 py-2">
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
