'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, FilePenLine, Trash2, Loader2, Search, ChevronDown } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import CommonTable from '@/components/v1/common/common-table/common-table';
import { getCoupons, deleteCoupon } from '@/apis/create-coupon.api';
import toast from 'react-hot-toast';

//  Strict Interface based on your API response
interface Coupon {
  id: string;
  code: string;
  title: string;
  type: 'PERCENT' | 'FIXED';
  discountValue: string; // API sends this as a string "100"
  discountUnit: 'PERCENTAGE' | 'FIXED' | 'FLAT';
  maxDiscountValue?: number;
  minPurchaseAmount?: number;
  minQuantity?: number;
  usagePerPerson?: number;
  currentUsageCount?: number;
  status: boolean;
  validFrom: string;
  validUntil: string | null;
  expiryType: 'FIXED' | 'RELATIVE';
  relativeDays: number | null;
  createdAt?: string;
  isAutoApplied: boolean;
}

const itemsPerPage = 8;

const CouponList: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search, Filter, Pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  // Delete state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  const [permanentDelete, setPermanentDelete] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await getCoupons();

      if (response && !response.error && response.payload) {
        const couponsData = Array.isArray(response.payload) ? response.payload : (response.payload.coupons ?? []);

        const normalizedCoupons: Coupon[] = (couponsData as any[]).map((c: any) => ({
          id: c.id,
          code: c.code,
          title: c.title ?? '',
          type: c.type ?? (c.discountUnit === 'PERCENTAGE' ? 'PERCENT' : 'FIXED'),
          discountValue: String(c.discountValue ?? '0'),
          discountUnit: c.discountUnit ?? 'FIXED',
          maxDiscountValue: Number(c.maxDiscountValue ?? 0),
          minPurchaseAmount: Number(c.minPurchaseAmount ?? 0),
          minQuantity: Number(c.minQuantity ?? 1),
          usagePerPerson: Number(c.usagePerPerson ?? 1),
          currentUsageCount: Number(c.currentUsageCount ?? 0),
          status: Boolean(c.status),
          validFrom: c.validFrom ?? new Date().toISOString(),
          validUntil: c.validUntil ?? null,
          expiryType: c.expiryType ?? 'FIXED',
          relativeDays: c.relativeDays ?? null,
          createdAt: c.createdAt || new Date().toISOString(),
          isAutoApplied: Boolean(c.isAutoApplied),
        }));

        setCoupons(normalizedCoupons);
      } else {
        toast.error(response?.message || 'Failed to fetch coupons');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Reset page on search/filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Handle Delete
  const handleDelete = (id: string) => {
    setSelectedCouponId(id);
    setPermanentDelete(false);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCouponId) return;

    try {
      const response = await deleteCoupon(selectedCouponId, permanentDelete);
      if (!response.error) {
        if (permanentDelete) {
          // Remove from list if permanent delete
          setCoupons((prev) => prev.filter((c) => c.id !== selectedCouponId));
          toast.success('Coupon permanently deleted');
        } else {
          // Mark as inactive if soft delete
          setCoupons((prev) => prev.map((c) => (c.id === selectedCouponId ? { ...c, status: false } : c)));
          toast.success('Coupon marked as inactive');
        }
      } else {
        toast.error(response.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete failed', error);
      toast.error('An error occurred during deletion');
    } finally {
      setIsDialogOpen(false);
      setSelectedCouponId(null);
      setPermanentDelete(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setSelectedCouponId(null);
    setPermanentDelete(false);
  };

  // Filter Logic
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ? true : statusFilter === 'active' ? coupon.status : !coupon.status;

    return matchesSearch && matchesStatus;
  });

  // Sorting Logic
  const sortedCoupons = React.useMemo(() => {
    if (!sortConfig.key) return filteredCoupons;

    return [...filteredCoupons].sort((a, b) => {
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
  }, [filteredCoupons, sortConfig]);

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
  const totalPages = Math.ceil(sortedCoupons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCoupons = sortedCoupons.slice(startIndex, startIndex + itemsPerPage);

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

  const columns = [
    {
      key: 'sno',
      label: 'S.No.',
      render: (_: Coupon, index: number) => <span className="text-foreground">{startIndex + index + 1}</span>,
    },
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      render: (item: Coupon) => <span className="text-foreground font-semibold">{item.code}</span>,
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (item: Coupon) => <span className="text-foreground">{item.title}</span>,
    },
    {
      key: 'discount',
      label: 'Discount',
      render: (item: Coupon) => (
        <span className="text-foreground font-medium">
          {item.discountUnit === 'PERCENTAGE' ? `${item.discountValue}%` : `₹${item.discountValue}`}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Coupon) =>
        item.status ? (
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-green-700 uppercase">
            Active
          </span>
        ) : (
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-red-700 uppercase">
            Inactive
          </span>
        ),
    },
    {
      key: 'validFrom',
      label: 'Valid From',
      render: (item: Coupon) => (
        <span className="text-foreground text-xs">{new Date(item.validFrom).toLocaleDateString('en-IN')}</span>
      ),
    },
    {
      key: 'validUntil',
      label: 'Valid Until',
      render: (item: Coupon) => (
        <span className="text-foreground text-xs">
          {item.expiryType === 'FIXED'
            ? item.validUntil
              ? new Date(item.validUntil).toLocaleDateString('en-IN')
              : '-'
            : `${item.relativeDays} days`}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      sortable: true,
      render: (item: Coupon) => (
        <span className="text-foreground text-xs">
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Coupon) => (
        <div className="flex justify-end gap-3 pr-2">
          <Link href={`/offers/edit-coupon/${item.id}`}>
            <FilePenLine className="text-foreground h-4 w-4 cursor-pointer" />
          </Link>
          <Trash2 className="text-foreground h-4 w-4 cursor-pointer" onClick={() => handleDelete(item.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="bg-sidebar w-full overflow-y-auto rounded p-4 shadow">
        <div className="mb-2 flex w-full items-center justify-between">
          <div>
            <h1 className="text-foreground text-xl font-bold">Coupons({coupons.length})</h1>
          </div>
          <Link href="/offers/add-coupon">
            <Button className="bg-primary text-primary-foreground flex cursor-pointer items-center gap-2 px-4 shadow transition-all hover:opacity-90">
              <Plus className="h-4 w-4" /> Add Coupon
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative my-4 w-full sm:w-1/3">
            <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border py-2 pr-10 pl-3 text-sm"
            />
          </div>
          <div className="relative z-50 w-full sm:w-1/2 md:w-1/3 lg:w-1/5 xl:w-1/6">
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="bg-sidebar text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2 text-left text-sm"
            >
              <span>{statusFilter === 'all' ? 'All Status' : statusFilter === 'active' ? 'Active' : 'Inactive'}</span>
              <ChevronDown className="text-foreground ml-2 h-4 w-4" />
            </button>
            {isStatusDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsStatusDropdownOpen(false)} />
                <div className="bg-sidebar absolute top-full left-0 z-50 mt-1 w-full cursor-pointer rounded border shadow-lg">
                  {['all', 'active', 'inactive'].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setStatusFilter(option);
                        setIsStatusDropdownOpen(false);
                      }}
                      className="text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full cursor-pointer px-3 py-2 text-left text-sm"
                    >
                      {option === 'all' ? 'All Status' : option === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="w-full">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <Loader2 className="text-primary h-10 w-10 animate-spin" />
              <p className="text-muted-foreground animate-pulse text-sm">Syncing coupons...</p>
            </div>
          ) : (
            <CommonTable<Coupon>
              columns={columns}
              data={currentCoupons}
              emptyMessage="No coupons found."
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          )}
        </div>

        {/* Pagination */}
        {sortedCoupons.length > 0 && (
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
      </div>

      {/* Delete Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="absolute" onClick={handleCancelDelete} />

          <div className="bg-background relative z-10 w-11/12 max-w-md rounded p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold">Delete Coupon</h3>
            <p className="text-muted-foreground mb-4 text-sm">Are you sure you want to delete this coupon?</p>

            <label className="mb-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={permanentDelete}
                onChange={(e) => setPermanentDelete(e.target.checked)}
                className="h-4 w-4 cursor-pointer"
              />
              Permanent delete
            </label>

            <div className="flex justify-end gap-3">
              <button onClick={handleCancelDelete} className="rounded border px-4 py-2">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="rounded bg-red-600 px-4 py-2 text-white">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponList;
