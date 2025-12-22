'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useMembershipStore } from '@/store/membershipStore';
import Link from 'next/link';

export default function CreateMembership() {
  const router = useRouter();
  const addMembership = useMembershipStore((state) => state.addMembership);

  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: '',
    color: '',
    sortOrder: 0,
    isActive: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMembership(form);
    router.push('/membership/membership-list');
  };

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center bg-gray-100 p-4">
      <div className="w-full overflow-y-auto rounded bg-white p-4 shadow-lg">
        <div className="mb-6 flex items-center justify-between border-b">
          <p className="text-md font-semibold">Create Membership</p>
          <Link
            href="/membership/membership-list"
            className="flex cursor-pointer rounded bg-orange-400 px-3 py-2 text-sm text-white transition hover:bg-orange-500"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-normal">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block font-normal">Icon URL</label>
              <input
                name="icon"
                value={form.icon}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-normal">Color (Hex)</label>
              <input
                name="color"
                value={form.color}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
                placeholder="#FF5733"
              />
            </div>
            <div>
              <label className="mb-1 block font-normal">Sort Order</label>
              <input
                type="number"
                name="sortOrder"
                value={form.sortOrder}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="mb-1 block font-normal">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-orange-500 checked:bg-orange-500 focus:ring-orange-500"
              />
              <label className="font-medium">Active</label>
            </div>
          </div>

          <button type="submit" className="w-[320px] cursor-pointer rounded bg-orange-500 py-2 text-white">
            Save Membership
          </button>
        </form>
      </div>
    </div>
  );
}
