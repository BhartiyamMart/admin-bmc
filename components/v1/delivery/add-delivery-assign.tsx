'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useDeliveryAssignStore } from '@/store/deliveryAssignStore';
import Link from 'next/link';

export default function AddDeliveryAssign() {
  const router = useRouter();
  const addAssign = useDeliveryAssignStore((state) => state.addAssign);

  const [form, setForm] = useState({
    orderId: '',
    deliveryPartnerId: '',
    status: 'PENDING',
    deliveryInstructionId: '',
    timeSlotId: '',
    distance: 0,
    otp: '',
    productImages: [] as string[],
    coinsEarned: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === 'distance' || name === 'coinsEarned' ? Number(value) : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAssign({ ...form });
    router.push('/delivery/delivery-assign');
  };

  return (
    <div className="bg-sidebar flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="w-full overflow-y-auto rounded p-4 shadow-lg">
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <h2 className="text-lg font-semibold">Assign Delivery</h2>
          <Link
            href="/delivery/delivery-assign"
            className="bg-primary text-background flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm transition"
          >
            <ChevronLeft className="h-4 w-4" /> Back to List
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded">
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block font-normal">Order ID</label>
              <input
                name="orderId"
                value={form.orderId}
                onChange={handleChange}
                required
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block font-normal">Delivery Partner ID</label>
              <input
                name="deliveryPartnerId"
                value={form.deliveryPartnerId}
                onChange={handleChange}
                required
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block font-normal">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              >
                <option value="PENDING">Pending</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-normal">Delivery Instruction ID</label>
              <input
                name="deliveryInstructionId"
                value={form.deliveryInstructionId}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block font-normal">Time Slot ID</label>
              <input
                name="timeSlotId"
                value={form.timeSlotId}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block font-normal">Distance (km)</label>
              <input
                type="number"
                step="0.1"
                name="distance"
                value={form.distance}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block font-normal">OTP</label>
              <input
                name="otp"
                value={form.otp}
                onChange={handleChange}
                required
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block font-normal">Product Images ( URLs)</label>
              <input
                name="productImages"
                value={form.productImages.join(',')}
                onChange={(e) =>
                  setForm({
                    ...form,
                    productImages: e.target.value.split(',').map((img) => img.trim()),
                  })
                }
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block font-normal">Coins Earned</label>
              <input
                type="number"
                name="coinsEarned"
                value={form.coinsEarned}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </div>

          <button type="submit" className="bg-primary text-background mt-10 w-[320px] rounded py-2">
            Save Assignment
          </button>
        </form>
      </div>
    </div>
  );
}
