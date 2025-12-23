'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, FilePenLine, Trash2 } from 'lucide-react';
import CommonTable from '@/components/v1/common/common-table/common-table';

// -------------------
// Offer Type
// -------------------
interface Offer {
  id: string;
  storeId: string;
  title: string;
  type: string;
  discountValue: number;
  discountUnit: string;
  status: boolean;
  startDateTime: string;
  endDateTime: string;
}

// -------------------
// Dummy Data
// -------------------
const dummyOffers: Offer[] = [
  {
    id: '1',
    storeId: 'Store001',
    title: 'Summer Sale',
    type: 'Percentage',
    discountValue: 20,
    discountUnit: '%',
    status: true,
    startDateTime: new Date().toISOString(),
    endDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    storeId: 'Store002',
    title: 'Buy 1 Get 1',
    type: 'BOGO',
    discountValue: 1,
    discountUnit: 'Free',
    status: false,
    startDateTime: new Date().toISOString(),
    endDateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    storeId: 'Store003',
    title: 'Festive Offer',
    type: 'Flat',
    discountValue: 50,
    discountUnit: '₹',
    status: true,
    startDateTime: new Date().toISOString(),
    endDateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// -------------------
// OfferList Component
// -------------------
const OfferList: React.FC = () => {
  const offers = dummyOffers;

  const columns = [
    {
      key: 'sno',
      label: 'S.No',
      render: (_: Offer, index: number) => index + 1,
    },
    { key: 'storeId', label: 'Store' },
    { key: 'title', label: 'Title' },
    { key: 'type', label: 'Type' },
    {
      key: 'discount',
      label: 'Discount',
      render: (item: Offer) => `${item.discountValue} ${item.discountUnit}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Offer) =>
        item.status ? (
          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Active</span>
        ) : (
          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Inactive</span>
        ),
    },
    {
      key: 'startDateTime',
      label: 'Start',
      render: (item: Offer) => new Date(item.startDateTime).toLocaleString(),
    },
    {
      key: 'endDateTime',
      label: 'End',
      render: (item: Offer) => new Date(item.endDateTime).toLocaleString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Offer) => (
        <div className="flex justify-end gap-2">
          <FilePenLine className="text-primary w-5 cursor-pointer" onClick={() => console.log('Edit:', item.id)} />
          <Trash2 className="text-primary w-5 cursor-pointer" onClick={() => console.log('Delete:', item.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="bg-sidebar w-full overflow-y-auto rounded p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between">
          <p className="text-md font-semibold">Offers</p>
          <Link href="/offers/add-offers">
            <Button className="bg-primary text-background flex cursor-pointer items-center gap-2">
              <Plus className="h-4 w-4" /> Add Offer
            </Button>
          </Link>
        </div>

        <div className="w-full min-w-[300px] min-w-full sm:w-[560px] md:w-[640px] lg:w-[900px] xl:w-[1100px]">
          {/* Table */}
          <CommonTable<Offer> columns={columns} data={offers} emptyMessage="No offers found." />
        </div>
      </div>
    </div>
  );
};

export default OfferList;
