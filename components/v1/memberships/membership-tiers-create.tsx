'use client';

import React, { useState } from 'react';
import { useMembershipTierStore } from '@/store/membershipTierStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function CreateMembershipTier() {
  const addTier = useMembershipTierStore((state) => state.addTier);
  const router = useRouter();

  const [form, setForm] = useState({
    memberShipId: '',
    sortOrder: 0,
    isActive: true,
    validityDays: 0,
    amount: 0,
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'sortOrder' || name === 'validityDays' || name === 'amount' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTier(form);
    router.push('/membership/membership-tier-list');
  };

  return (
    <div className="flex min-h-screen justify-center bg-gray-100 p-4">
      <div className="max-h-[89vh] w-full overflow-y-auto rounded bg-white p-4 shadow-lg">
        <div className="mb-6 flex items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Create Membership Tier</p>
          <Link
            href="/membership/membership-tier-list"
            className="flex cursor-pointer rounded bg-orange-400 px-3 py-2 text-sm text-white transition hover:bg-orange-500"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1 block font-normal" htmlFor="memberShipId">
                Membership ID
              </Label>
              <Input
                className="w-full rounded border px-3 py-2"
                id="memberShipId"
                name="memberShipId"
                value={form.memberShipId}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label className="mb-1 block font-normal" htmlFor="sortOrder">
                Sort Order
              </Label>
              <Input
                className="w-full rounded border px-3 py-2"
                type="number"
                id="sortOrder"
                name="sortOrder"
                value={form.sortOrder}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1 block font-normal" htmlFor="validityDays">
                Validity Days
              </Label>
              <Input
                className="w-full rounded border px-3 py-2"
                type="number"
                id="validityDays"
                name="validityDays"
                value={form.validityDays}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label className="mb-1 block font-normal" htmlFor="amount">
                Amount (₹)
              </Label>
              <Input
                className="w-full rounded border px-3 py-2"
                type="number"
                id="amount"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <Label className="mb-1 block font-normal" htmlFor="description">
              Description
            </Label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Is Active
            </label>
          </div>

          <div className="flex space-x-2">
            <Button className="w-[320px] cursor-pointer rounded bg-orange-500 py-2 text-white" type="submit">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
