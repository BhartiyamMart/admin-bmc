'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, FilePenLine, Trash2, Loader2 } from 'lucide-react';
import CommonTable from '@/components/v1/common/common-table/common-table';
import { getCoupons } from '@/apis/create-coupon.api';
import toast from 'react-hot-toast';

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
          <Link href={`/offers/edit-coupon/${item.id}`}>
            <FilePenLine className="text-foreground h-4 w-4 cursor-pointer" />
          </Link>
          <Trash2
            className="text-foreground h-4 w-4 cursor-pointer"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this coupon?')) {
                // Implement delete logic
                toast.success(`Delete requested for ${item.code}`);
              }
            }}
          />
        </div>
      ),
    },
  ];

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

        <div className="w-full">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <Loader2 className="text-primary h-10 w-10 animate-spin" />
              <p className="text-muted-foreground animate-pulse text-sm">Syncing coupons...</p>
            </div>
          ) : (
            <CommonTable<Coupon> columns={columns} data={coupons} emptyMessage="No coupons found." />
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponList;
