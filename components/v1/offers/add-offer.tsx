'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useOfferStore } from '@/store/offerStore';
import Link from 'next/link';

export default function AddOffer() {
  const router = useRouter();
  const addOffer = useOfferStore((state) => state.addOffer);

  const [form, setForm] = useState({
    storeId: '',
    title: '',
    description: '',
    shortDescription: '',
    type: '',
    discountValue: 0,
    discountUnit: 'PERCENTAGE',
    minPurchaseAmount: 0,
    minQuantity: 1,
    status: 'SCHEDULED',
    startDateTime: '',
    endDateTime: '',
    usagePerUser: 999999,
    targetAudience: ['ALL'],
    eligibleCities: [] as string[],
    bannerImage: '',
    thumbnailImage: '',
    offerImages: [] as string[],
    seoTitle: '',
    seoDescription: '',
    tags: [] as string[],
    termsAndConditions: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]:
        name === 'discountValue' || name === 'minPurchaseAmount' || name === 'minQuantity' || name === 'usagePerUser'
          ? Number(value)
          : value,
    });
  };

  const handleArrayChange = (name: string, value: string) => {
    setForm({
      ...form,
      [name]: value.split(',').map((v) => v.trim()),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addOffer({ ...form });
    router.push('/offers/offers-list');
  };

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="bg-sidebar w-full overflow-y-auto rounded p-4 shadow-lg">
        <div className="mb-4 flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-semibold">Create Offer</h2>

          <Link
            href="/offers/offers-list"
            className="bg-primary text-background flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm transition"
          >
            <ChevronLeft className="h-4 w-4" /> Back to List
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3">
            <div>
              <label className="mb-1 block font-normal">Store ID</label>
              <input
                name="storeId"
                value={form.storeId}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block font-normal">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block font-normal">Type</label>
              <input
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block font-normal">Discount Value</label>
              <input
                type="number"
                name="discountValue"
                value={form.discountValue}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block font-normal">Discount Unit</label>
              <select
                name="discountUnit"
                value={form.discountUnit}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block font-normal">Min Purchase Amount</label>
              <input
                type="number"
                name="minPurchaseAmount"
                value={form.minPurchaseAmount}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block font-normal">Min Quantity</label>
              <input
                type="number"
                name="minQuantity"
                value={form.minQuantity}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block font-normal">Start Date Time</label>
              <input
                type="datetime-local"
                name="startDateTime"
                value={form.startDateTime}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block font-normal">End Date Time</label>
              <input
                type="datetime-local"
                name="endDateTime"
                value={form.endDateTime}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block font-normal">Target Audience</label>
              <input
                value={form.targetAudience.join(',')}
                onChange={(e) => handleArrayChange('targetAudience', e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block font-normal">Eligible Cities </label>
              <input
                value={form.eligibleCities.join(',')}
                onChange={(e) => handleArrayChange('eligibleCities', e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block font-normal">Offer Images </label>
              <input
                value={form.offerImages.join(',')}
                onChange={(e) => handleArrayChange('offerImages', e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-normal">Tags </label>
              <input
                value={form.tags.join(',')}
                onChange={(e) => handleArrayChange('tags', e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block font-normal">SEO Title</label>
              <input
                name="seoTitle"
                value={form.seoTitle}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-normal">SEO Description</label>
              <textarea
                name="seoDescription"
                value={form.seoDescription}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block font-normal">Terms and Conditions</label>
              <textarea
                name="termsAndConditions"
                value={form.termsAndConditions}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-normal">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block font-normal">Short Description</label>
              <textarea
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <button type="submit" className="bg-primary text-background w-[320px] rounded py-2">
                Save Offer
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
