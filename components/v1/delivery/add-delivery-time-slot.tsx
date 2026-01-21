'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createTimeSlot, updateTimeSlot, TimeSlotPayload, getTimeSlots } from '@/apis/create-time-slot.api';
import { Switch } from '@radix-ui/react-switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import toast from 'react-hot-toast';
export default function AddTimeSlot() {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const slotId = searchParams.get('id') || null;

  const [form, setForm] = useState<TimeSlotPayload>({
    label: '',
    startTime: '',
    endTime: '',
    status: true,
    sortOrder: 0,
  });

  const startDate = form.startTime ? new Date(form.startTime) : null;

  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const fetchSlot = async () => {
      setFormLoading(true);
      try {
        const res = await getTimeSlots();
        if (res?.payload && Array.isArray(res.payload)) {
          const slot = res.payload.find((s: TimeSlotPayload) => s.id === slotId);
          if (slot) setForm(slot);
        }
      } catch (err) {
        console.error('Error fetching slot:', err);
      } finally {
        setFormLoading(false);
      }
    };

    fetchSlot();
  }, [slotId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: TimeSlotPayload = {
        ...form,
        sortOrder: Number(form.sortOrder),
        id: slotId || undefined,
      };

      if (slotId) {
        await updateTimeSlot(payload);
      } else {
        await createTimeSlot(payload);
        toast.success('Time slot created successfully');
      }

      router.push('/delivery/delivery-time-slots');
    } catch (error) {
      console.error('Error saving time slot:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (formLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading slot details...</p>
      </div>
    );
  }

  return (
    <div className="bg-sidebar flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="w-full overflow-y-auto rounded p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">{slotId ? 'Edit Delivery Time Slot' : 'Add Delivery Time Slot'}</p>

          <Link
            href="/delivery/delivery-time-slots"
            className="bg-primary text-background flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm transition"
          >
            <ChevronLeft className="h-4 w-4" /> Back to List
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded">
          <div className="bg-sidebar w-full border px-6 py-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block font-normal">
                  Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="label"
                  value={form.label}
                  onChange={handleChange}
                  placeholder="e.g. Morning Slot"
                  className="w-full rounded border px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block font-normal">
                  Sort Order <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="sortOrder"
                    value={form.sortOrder || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow single digit 1-5 OR empty
                      if (value === '' || /^[1-5]$/.test(value)) {
                        handleChange(e);
                      }
                    }}
                    placeholder="1-5"
                    className="w-full rounded border px-3 py-2 pr-10"
                    maxLength={1}
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-normal">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.startTime || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                  className="focus:ring-primary input:[cursor-pointer] w-full cursor-pointer rounded border px-3 py-2 focus:ring-1 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block font-normal">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.endTime || ''}
                  disabled={!form.startTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                  className="focus:ring-primary w-full cursor-pointer rounded border px-3 py-2 focus:ring-1 focus:outline-none disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <div className="mt-4 md:col-span-3">
              <div className="flex items-center justify-between rounded border p-4">
                <div>
                  <label htmlFor="isactive" className="block text-sm font-medium">
                    Active
                  </label>
                  <p className="text-foreground/60 text-xs">
                    {form.status ? 'Delivery time slot is active and visible' : 'Delivery time slot is inactive'}
                  </p>
                </div>
                <Switch
                  id="isactive"
                  checked={form.status}
                  onCheckedChange={(checked) => setForm((prev) => ({ ...prev, status: checked }))}
                  className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors ${
                    form.status ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form.status ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </Switch>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="bg-primary text-background mt-4 w-[320px] rounded py-2">
            {loading ? 'Saving...' : slotId ? 'Update' : 'Save Delivery Time Slot'}
          </Button>
        </form>
      </div>
    </div>
  );
}
