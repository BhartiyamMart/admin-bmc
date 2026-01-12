'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, FilePenLine, Trash2, Loader2, Search, ChevronDown } from 'lucide-react';
import CommonTable from '@/components/v1/common/common-table/common-table';
import { getCoupons, deleteCoupon } from '@/apis/create-coupon.api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
// Strict Interface based on your API response
interface Coupon {
  id: string;
  code: string;
  title: string;
  discountValue: string;
  discountUnit: 'PERCENTAGE' | 'FIXED' | 'FLAT';
  status: boolean;
  validFrom: string;
  validUntil: string | null;
  expiryType: 'FIXED' | 'RELATIVE';
  relativeDays: number | null;
  couponImage: string;
  isAutoApplied: boolean;
}

const CouponList: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    couponId: string | null;
    couponCode: string;
  }>({ open: false, couponId: null, couponCode: '' });

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await getCoupons();

      // Checking error flag from your ApiResponse structure
      if (response && !response.error && response.payload) {
        setCoupons(response.payload.coupons);
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

  //  Handle edit
  const handleEditCoupon = (couponId: string) => {
    router.push(`/offers/edit-coupon/${couponId}`);
  };

  const openDeleteDialog = (couponId: string, couponCode: string) => {
    setDeleteDialog({
      open: true,
      couponId,
      couponCode,
    });
  };

  //  Delete API Integration
  const handleDeleteCoupon = async () => {
    if (!deleteDialog.couponId) return;
    setDeletingId(deleteDialog.couponId);

    try {
      const response = await deleteCoupon(deleteDialog.couponId);

      if (response && response.status === 200 && !response.error) {
        toast.success('Coupon deleted successfully!');
        setDeleteDialog({ open: false, couponId: null, couponCode: '' });
        await fetchCoupons();
      } else {
        toast.error(response?.message || 'Failed to delete coupon');
      }
    } catch (error) {
      toast.error('Something went wrong while deleting coupon');
    } finally {
      setDeletingId(null);
    }
  };



  const columns = [
    {
      key: 'sno',
      label: 'S.No.',
      render: (_: Coupon, index: number) => <span className="text-foreground">{index + 1}</span>,
    },
    {
      key: 'code',
      label: 'Code',
      render: (item: Coupon) => <span className="text-foreground font-semibold">{item.code}</span>,
    },
    {
      key: 'title',
      label: 'Title',
      render: (item: Coupon) => <span className="text-foreground">{item.title}</span>,
    },
    {
      key: 'discount',
      label: 'Discount',
      render: (item: Coupon) => (
        <span className="text-foreground font-medium">
          {/* Correct formatting based on discountUnit */}
          {item.discountUnit === 'PERCENTAGE' ? `${item.discountValue}%` : `${item.discountValue}Rs.`}
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
      key: 'actions',
      label: 'Actions',
      render: (item: Coupon) => (
        <div className="flex justify-end gap-3">
          {/* Edit */}
          <Link href={`/offers/edit-coupon/${item.id}`}>
            <FilePenLine className="text-foreground h-4 w-4 cursor-pointer" />
          </Link>

          {/* Delete */}
          <Trash2
            className={`h-4 w-4 cursor-pointer ${!item.status ? 'opacity-40 cursor-not-allowed' : 'text-foreground'
              }`}
            onClick={() => {
              if (!item.status) return;
              openDeleteDialog(item.id, item.code);
            }}
          />
        </div>
      ),
    }

  ];

  // Filter logic
  const filteredCoupons = coupons.filter((coupon) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      coupon.code.toLowerCase().includes(search) ||
      coupon.title.toLowerCase().includes(search) ||
      coupon.discountValue.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
          ? coupon.status === true
          : coupon.status === false;

    return matchesSearch && matchesStatus;
  });


  // Pagination logic
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCoupons = filteredCoupons.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Pagination controls
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  // Generate page numbers 
  const generatePageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];

    // If total pages is 4 or less, show all pages
    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Case 1: Current page is in first 3 pages (1, 2, or 3)
    if (currentPage <= 3) {
      pages.push(1, 2, 3);
      pages.push('ellipsis');
      pages.push(totalPages);
      return pages;
    }

    // Case 2: Current page is near the end (last 3 pages)
    if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push('ellipsis');
      pages.push(totalPages - 2, totalPages - 1, totalPages);
      return pages;
    }

    // Case 3: Current page is in the middle
    pages.push(1);
    pages.push('ellipsis');
    pages.push(currentPage - 1, currentPage, currentPage + 1);
    pages.push('ellipsis');
    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = generatePageNumbers();



  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="bg-sidebar w-full overflow-y-auto rounded p-4 shadow">
        <div className="mb-6 flex w-full items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-foreground text-xl font-bold">Coupons({coupons.length})</h1>
          </div>
          <Link href="/offers/add-coupon">
            <Button className="bg-primary text-primary-foreground flex cursor-pointer items-center gap-2 px-4 shadow transition-all hover:opacity-90">
              <Plus className="h-4 w-4" /> Add Coupon
            </Button>
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-1/3">
            <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search by code, title, or discount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border py-2 pr-10 pl-3 text-sm"
            />
          </div>

          <div className="relative z-50 w-full sm:w-1/2 md:w-1/3 lg:w-1/5 xl:w-1/6">
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="bg-sidebar flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2 text-left text-sm"
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
                      className="w-full cursor-pointer px-3 py-2 text-left text-sm"
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
            />
          )}
          {filteredCoupons.length > itemsPerPage && (
            <div className="mt-6 flex justify-end">
              <Pagination>
                <PaginationContent>
                  {/* Previous Button */}
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

                  {/* Page Numbers */}
                  {pageNumbers.map((page, index) => {
                    if (page === 'ellipsis') {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    return (
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
                    );
                  })}

                  {/* Next Button */}
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

        {/* Delete Confirmation Dialog */}
        {deleteDialog.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-background w-full max-w-sm rounded-lg p-6 shadow-lg">
              <h2 className="text-lg font-semibold">Delete Coupon</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Are you sure you want to delete coupon <b>{deleteDialog.couponCode}</b>?
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    setDeleteDialog({ open: false, couponId: null, couponCode: '' })
                  }
                >
                  Cancel
                </Button>

                <Button
                  variant="destructive"
                  disabled={deletingId === deleteDialog.couponId}
                  onClick={handleDeleteCoupon}
                >
                  {deletingId === deleteDialog.couponId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Delete'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
};

export default CouponList;
