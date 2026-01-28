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
import { Column, FlattenedBanner } from '@/interface/common.interface';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { deleteBanner, getBanner } from '@/apis/create-banners.api';
import { useRouter } from 'next/navigation';

export default function BannerList() {
  const router = useRouter();

  const [banners, setBanners] = useState<FlattenedBanner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [SelectedBannerId, setSelectedBannerId] = useState<string | null>(null);
  const [permanentDelete, setPermanentDelete] = useState(false);

  // Search & Filter & Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priorityFilter]);

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
        fetchBanners();
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
      const response = await getBanner(); // ✅ No type annotation needed

      console.log('API Response:', response);

      if (response.error) {
        toast.error(response.message || 'Failed to fetch banners');
        return;
      }

      if (response.payload?.banners) {
        // ✅ Map through banner groups and flatten
        const flatList: FlattenedBanner[] = response.payload.banners.flatMap((group) =>
          group.banners.map((b) => ({
            id: b.id,
            title: b.title,
            tag: group.tag,
            priority: b.priority,
            bannerUrl: b.bannerUrl,
            description: b.description,
            imageUrlSmall: b.images.small,
            imageUrlMedium: b.images.medium || null, // ✅ Now properly typed
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

  // Filter banners using useMemo
  const filteredBanners = React.useMemo(() => {
    return banners.filter((banner) => {
      const matchesSearch =
        banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        banner.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (banner.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPriority = priorityFilter === 'all' ? true : banner.priority.toString() === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [banners, searchTerm, priorityFilter]);

  // Extract unique priorities for the filter dropdown
  const uniquePriorities = React.useMemo(() => {
    const priorities = Array.from(new Set(banners.map((b) => b.priority))).sort((a, b) => a - b);
    return priorities.map((p) => p.toString());
  }, [banners]);

  // Sorting Logic
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

  // Pagination Logic
  const totalPages = Math.ceil(sortedBanners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBanners = sortedBanners.slice(startIndex, startIndex + itemsPerPage);

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

  const columns: Column<FlattenedBanner>[] = [
    {
      key: 'sno',
      label: 'S.No.',
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
          className="h-12 w-12 rounded border object-cover"
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
        <div className="mr-2 flex justify-end gap-2">
          <FilePenLine
            className="text-primary hover:text-primary/80 w-5 cursor-pointer transition-colors"
            onClick={() => handleEdit(item.id)}
          />
          <Trash2 className="text-foreground w-5 cursor-pointer" onClick={() => handleDelete(item.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-sidebar flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="w-full overflow-y-auto rounded p-4 shadow-lg">
        <div className="flex w-full items-center justify-between">
          <p className="text-md font-semibold">Banner List</p>
          <Link href="/banner/create-banner">
            <Button className="bg-primary flex cursor-pointer items-center gap-2">
              <Plus className="h-4 w-4" /> Add Banner
            </Button>
          </Link>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative my-4 w-full sm:w-1/3">
            <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search banners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:border-primary w-full rounded border py-2 pr-10 pl-3 text-sm focus:outline-none"
            />
          </div>
          <div className="relative z-50 w-full sm:w-1/2 md:w-1/3 lg:w-1/5 xl:w-1/6">
            <button
              onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
              className="bg-sidebar flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2 text-left text-sm"
            >
              <span>{priorityFilter === 'all' ? 'All Priority' : `Priority: ${priorityFilter}`}</span>
              <ChevronDown className="text-foreground ml-2 h-4 w-4" />
            </button>
            {isPriorityDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsPriorityDropdownOpen(false)} />
                <div className="bg-sidebar absolute top-full left-0 z-50 mt-1 w-full cursor-pointer rounded border shadow-lg">
                  <button
                    onClick={() => {
                      setPriorityFilter('all');
                      setIsPriorityDropdownOpen(false);
                    }}
                    className="w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    All Priority
                  </button>
                  {uniquePriorities.map((priority) => (
                    <button
                      key={priority}
                      onClick={() => {
                        setPriorityFilter(priority);
                        setIsPriorityDropdownOpen(false);
                      }}
                      className="w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Priority: {priority}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading banners...</p>
        ) : (
          <>
            <CommonTable<FlattenedBanner>
              columns={columns}
              data={currentBanners}
              emptyMessage="No banners found."
              sortConfig={sortConfig}
              onSort={handleSort}
            />

            {/* Pagination */}
            {filteredBanners.length > 0 && (
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

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCancelDelete} aria-hidden="true" />
          <div className="relative z-10 w-11/12 max-w-md rounded bg-white p-6 shadow-lg">
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
                <button onClick={handleCancelDelete} className="cursor-pointer rounded border px-4 py-2">
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="cursor-pointer rounded bg-red-600 px-4 py-2 text-white"
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
