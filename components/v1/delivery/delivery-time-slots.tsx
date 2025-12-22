'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FilePenLine, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CommonTable from '@/components/v1/common/common-table/common-table';
import { getTimeSlots, deleteTimeSlot } from '@/apis/create-time-slot.api';

interface TimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  status: boolean;
  sortOrder: number;
}

const DeliveryTimeSlotList = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [permanentDelete, setPermanentDelete] = useState(false);

  const fetchTimeSlots = async () => {
    setLoading(true);
    try {
      const response = await getTimeSlots();

      if (response?.payload && Array.isArray(response.payload)) {
        setTimeSlots(response.payload);
      } else {
        setTimeSlots([]); // safe fallback
      }
    } catch (error) {
      console.error('Failed to fetch time slots', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  // Open delete modal
  const handleDelete = (id: string) => {
    setSelectedSlotId(id);
    setPermanentDelete(false);
    setIsDialogOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedSlotId) return;

    try {
      const response = await deleteTimeSlot(selectedSlotId, permanentDelete);

      if (!response.error) {
        setTimeSlots((prev) => prev.filter((slot) => slot.id !== selectedSlotId));
      } else {
        alert(response.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete slot failed:', error);
    } finally {
      setIsDialogOpen(false);
      setSelectedSlotId(null);
      setPermanentDelete(false);
    }
  };

  // Cancel modal
  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setSelectedSlotId(null);
    setPermanentDelete(false);
  };

  const columns = [
    {
      key: 'sno',
      label: 'S.No',
      render: (_: TimeSlot, index: number) => index + 1,
    },
    { key: 'label', label: 'Label' },
    { key: 'startTime', label: 'Start Time' },
    { key: 'endTime', label: 'End Time' },

    {
      key: 'status',
      label: 'Status',
      render: (slot: TimeSlot) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            slot.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {slot.status ? 'Active' : 'Inactive'}
        </span>
      ),
    },

    {
      key: 'actions',
      label: 'Actions',
      render: (slot: TimeSlot) => (
        <div className="flex justify-end gap-3 pr-4">
          {/* EDIT BUTTON */}
          <Link href={`/setting/delivery-time-slots/edit/${slot.id}`}>
            <FilePenLine className="text-foreground h-5 w-5 cursor-pointer" />
          </Link>

          {/* DELETE BUTTON */}
          <Trash2 className="w-5 cursor-pointer text-red-600" onClick={() => handleDelete(slot.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-sidebar flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="w-full overflow-y-auto rounded p-4 shadow-lg">
        <div className="mb-4 flex w-full items-center justify-between">
          <p className="text-md font-semibold">Delivery Time Slots</p>
          <Link href="/delivery/time-slot-form">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Time Slot
            </Button>
          </Link>
        </div>

        <div className="w-full min-w-full sm:w-[560px] md:w-[640px] lg:w-[900px] xl:w-[1100px]">
          <CommonTable
            columns={columns}
            data={timeSlots || []}
            emptyMessage={loading ? 'Loading...' : 'No Time Slots Found'}
          />
        </div>
      </div>

      {/* Delete Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCancelDelete} aria-hidden="true" />

          <div className="relative z-10 w-11/12 max-w-md rounded bg-white p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold">Delete Time Slot</h3>
            <p className="mb-4 text-sm text-gray-700">Are you sure you want to delete this time slot?</p>

            <label className="mb-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={permanentDelete}
                onChange={(e) => setPermanentDelete(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-gray-300"
              />
              <span className="text-xs">Permanent delete</span>
            </label>

            <div className="flex justify-end gap-3">
              <button onClick={handleCancelDelete} className="cursor-pointer rounded border px-4 py-2">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="cursor-pointer rounded bg-red-600 px-4 py-2 text-white">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryTimeSlotList;
