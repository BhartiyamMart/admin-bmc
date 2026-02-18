'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, FilePenLine, Trash2, Search, ChevronDown } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import CommonTable from '@/components/common/common-table/common-table';
import { Column } from '@/interface/common.interface';
import { FlattenedBanner } from '@/interface/banner.interface';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { deleteBanner, getAllBanners, deactivateBanner, reActivateBanner } from '@/apis/banners.api';
import { useRouter } from 'next/navigation';

export default function BannerList() {
  const router = useRouter();

  const [banners, setBanners] = useState<FlattenedBanner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBannerId, setSelectedBannerId] = useState<string | null>(null);

  // ✅ New state for deactivation modal
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [selectedBannerForToggle, setSelectedBannerForToggle] = useState<FlattenedBanner | null>(null);

  // Pagination state (managed by backend)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBanners, setTotalBanners] = useState(0);
  const itemsPerPage = 10;

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  // Available tags for filter
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Sorting state (client-side for current page)
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  const handleEdit = (bannerId: string) => {
    router.push(`/banner/edit-banner/${bannerId}`);
  };

  // ✅ Opens delete confirmation dialog
  const handleDelete = (bannerId: string) => {
    setSelectedBannerId(bannerId);
    setIsDeleteDialogOpen(true);
  };

  // ✅ Executes delete after confirmation
  const handleConfirmDelete = async () => {
    if (!selectedBannerId) return;

    try {
      const response = await deleteBanner(selectedBannerId);
      if (!response || response.error) {
        toast.error(response?.message || 'Failed to delete banner');
      } else {
        toast.success('Banner deleted successfully');
        fetchBanners(); // Refresh list
      }
    } catch (error) {
      console.error('Delete Banner failed:', error);
      toast.error('Failed to delete Banner');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedBannerId(null);
    }
  };

  // ✅ Cancels delete operation
  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setSelectedBannerId(null);
  };

  // ✅ Toggle handler - Opens deactivation modal or directly reactivates
  const handleToggleStatus = (banner: FlattenedBanner) => {
    if (banner.status) {
      // Banner is active, show deactivation modal
      setSelectedBannerForToggle(banner);
      setDeactivationReason('');
      setIsDeactivateDialogOpen(true);
    } else {
      // Banner is inactive, reactivate directly
      handleReactivate(banner.id);
    }
  };

  // ✅ Deactivate banner with reason
  const handleDeactivate = async () => {
    if (!selectedBannerForToggle || !deactivationReason.trim()) {
      toast.error('Please provide a reason for deactivation');
      return;
    }

    try {
      const response = await deactivateBanner(selectedBannerForToggle.id, deactivationReason.trim());
      if (!response || response.error) {
        toast.error(response?.message || 'Failed to deactivate banner');
      } else {
        toast.success('Banner deactivated successfully');
        fetchBanners(); // Refresh list
      }
    } catch (error) {
      console.error('Deactivate Banner failed:', error);
      toast.error('Failed to deactivate banner');
    } finally {
      setIsDeactivateDialogOpen(false);
      setSelectedBannerForToggle(null);
      setDeactivationReason('');
    }
  };

  // ✅ Reactivate banner
  const handleReactivate = async (bannerId: string) => {
    try {
      const response = await reActivateBanner(bannerId);
      if (!response || response.error) {
        toast.error(response?.message || 'Failed to reactivate banner');
      } else {
        toast.success('Banner reactivated successfully');
        fetchBanners(); // Refresh list
      }
    } catch (error) {
      console.error('Reactivate Banner failed:', error);
      toast.error('Failed to reactivate banner');
    }
  };

  // ✅ Cancel deactivation
  const handleCancelDeactivate = () => {
    setIsDeactivateDialogOpen(false);
    setSelectedBannerForToggle(null);
    setDeactivationReason('');
  };

  // ✅ Fetch banners with proper API parameters
  const fetchBanners = async (): Promise<void> => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(tagFilter !== 'all' && { tag: tagFilter }),
        ...(statusFilter !== undefined && { status: statusFilter }),
      };

      const response = await getAllBanners(params);

      console.log('API Response:', response);

      if (response.error) {
        toast.error(response.message || 'Failed to fetch banners');
        setBanners([]);
        return;
      }

      if (response.payload?.banners) {
        // ✅ Map API response to flattened structure
        const flatList: FlattenedBanner[] = response.payload.banners.map((banner) => ({
          id: banner.id,
          title: banner.title,
          tag: banner.tag,
          priority: banner.priority,
          bannerUrl: banner.bannerUrl,
          description: banner.description,
          imageUrlSmall: banner.imageSmall.url,
          imageUrlLarge: banner.imageLarge.url,
          status: banner.status,
        }));

        setBanners(flatList);
        setTotalBanners(response.payload.banners.length || 0);
        setTotalPages(response.payload.totalPages || 1);

        // ✅ Extract unique tags for filter dropdown
        const uniqueTags = Array.from(new Set(flatList.map((b) => b.tag)));
        setAvailableTags(uniqueTags);
      } else {
        setBanners([]);
        toast.error('No banner data found');
      }
    } catch (error) {
      console.error('Fetch banners error:', error);
      toast.error('Something went wrong while fetching banners');
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch banners when page or filters change
  useEffect(() => {
    fetchBanners();
  }, [currentPage, tagFilter, statusFilter]);

  // ✅ Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [tagFilter, statusFilter]);

  // ✅ Client-side search filter (on current page data)
  const filteredBanners = React.useMemo(() => {
    if (!searchTerm.trim()) return banners;

    return banners.filter((banner) => {
      const matchesSearch =
        banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        banner.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (banner.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [banners, searchTerm]);

  // ✅ Sorting Logic (client-side on current page)
  const sortedBanners = React.useMemo(() => {
    if (!sortConfig.key) return filteredBanners;

    return [...filteredBanners].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key!];
      const bValue = (b as any)[sortConfig.key!];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredBanners, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  // ✅ Pagination handler
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Pagination number generator
  const generatePageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    if (currentPage <= 3) {
      pages.push(1, 2, 3, 'ellipsis', totalPages);
      return pages;
    }

    if (currentPage >= totalPages - 2) {
      pages.push(1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages);
      return pages;
    }

    pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  // ✅ Table columns with toggle switch
  const columns: Column<FlattenedBanner>[] = [
    {
      key: 'sno',
      label: 'S.No.',
      render: (_item, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    {
      key: 'imageUrlSmall',
      label: 'Image',
      render: (item) => (
        <Image
          width={48}
          height={48}
          src={item.imageUrlSmall || '/placeholder.jpg'}
          alt={item.title}
          className="h-12 w-12 rounded border object-cover"
          unoptimized
        />
      ),
    },
    { key: 'title', label: 'Title' },
    { key: 'tag', label: 'Tag' },
    { key: 'priority', label: 'Priority' },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <div className="flex items-center gap-2">
          {/* Toggle Switch */}
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={item.status}
              onChange={() => handleToggleStatus(item)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-300 peer-checked:bg-green-600 peer-focus:ring-2 peer-focus:ring-green-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-green-800"></div>
          </label>
        </div>
      ),
    },
    {
      key: 'bannerUrl',
      label: 'Banner URL',
      render: (item) =>
        item.bannerUrl ? (
          <a href={item.bannerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            Visit
          </a>
        ) : (
          <span className="text-gray-400">No URL</span>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item) => (
        <div className="mr-2 flex justify-end gap-2">
          <FilePenLine
            className="text-primary hover:text-primary/80 h-5 w-5 cursor-pointer transition-colors"
            onClick={() => handleEdit(item.id)}
          />
          <Trash2
            className="h-5 w-5 cursor-pointer text-red-600 transition-colors hover:text-red-800"
            onClick={() => handleDelete(item.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-sidebar flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="w-full overflow-y-auto rounded p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between">
          <p className="text-md font-semibold">Banner List</p>
          <Link href="/banner/create-banner">
            <Button className="bg-primary flex cursor-pointer items-center gap-2">
              <Plus className="h-4 w-4" /> Add Banner
            </Button>
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-1/3">
            <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search banners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:border-primary w-full rounded border py-2 pr-10 pl-3 text-sm focus:outline-none"
            />
          </div>

          {/* Tag Filter */}
          <div className="relative z-50 w-full sm:w-1/4">
            <button
              onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
              className="bg-sidebar flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2 text-left text-sm"
            >
              <span>{tagFilter === 'all' ? 'All Tags' : tagFilter}</span>
              <ChevronDown className="text-foreground ml-2 h-4 w-4" />
            </button>
            {isTagDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsTagDropdownOpen(false)} />
                <div className="bg-sidebar absolute top-full left-0 z-50 mt-1 w-full rounded border shadow-lg">
                  <button
                    onClick={() => {
                      setTagFilter('all');
                      setIsTagDropdownOpen(false);
                    }}
                    className="w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    All Tags
                  </button>
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setTagFilter(tag);
                        setIsTagDropdownOpen(false);
                      }}
                      className="w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-2 text-sm text-gray-600">
          Showing {sortedBanners.length} of {totalBanners} banners
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
            <p className="ml-3 text-gray-500">Loading banners...</p>
          </div>
        ) : (
          <>
            <CommonTable<FlattenedBanner>
              columns={columns}
              data={sortedBanners}
              emptyMessage="No banners found."
              sortConfig={sortConfig}
              onSort={handleSort}
            />

            {/* Pagination */}
            {totalBanners > 0 && (
              <div className="mt-6 flex justify-end">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage - 1);
                        }}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>

                    {pageNumbers.map((page, index) =>
                      page === 'ellipsis' ? (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page as number);
                            }}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      {/* ✅ Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCancelDelete} aria-hidden="true" />
          <div className="relative z-10 w-11/12 max-w-md rounded bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-semibold">Delete Banner</h3>
            <p className="mb-6 text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this banner? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                className="cursor-pointer rounded border px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="cursor-pointer rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Deactivation Reason Dialog */}
      {isDeactivateDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCancelDeactivate} aria-hidden="true" />
          <div className="relative z-10 w-11/12 max-w-md rounded bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-semibold">Deactivate Banner</h3>
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              Please provide a reason for deactivating "{selectedBannerForToggle?.title}"
            </p>
            <div className="mb-4">
              <label htmlFor="deactivation-reason" className="mb-2 block text-sm font-medium">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="deactivation-reason"
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                placeholder="Enter reason for deactivation..."
                rows={4}
                className="focus:border-primary focus:ring-primary/20 w-full rounded border border-gray-300 p-2 text-sm focus:ring-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
              />
              {!deactivationReason.trim() && <p className="mt-1 text-xs text-gray-500">This field is required</p>}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDeactivate}
                className="cursor-pointer rounded border px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={!deactivationReason.trim()}
                className="cursor-pointer rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
