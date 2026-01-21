'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FilePenLine, Plus, Trash2, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
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

const itemsPerPage = 8;

const DeliveryTimeSlotList = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Delete Modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [permanentDelete, setPermanentDelete] = useState(false);

  // Fetch slots
  const fetchTimeSlots = async () => {
    setLoading(true);
    try {
      const response = await getTimeSlots();
      if (response?.payload && Array.isArray(response.payload)) {
        setTimeSlots(response.payload);
      } else {
        setTimeSlots([]);
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

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filtered data
  const filteredSlots = timeSlots.filter((slot) => slot.label.toLowerCase().includes(searchTerm.toLowerCase()));

  // Pagination calculations
  const totalPages = Math.ceil(filteredSlots.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSlots = filteredSlots.slice(startIndex, startIndex + itemsPerPage);
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
  // Delete handlers
  const handleDelete = (id: string) => {
    setSelectedSlotId(id);
    setPermanentDelete(false);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSlotId) return;

    try {
      const response = await deleteTimeSlot(selectedSlotId, permanentDelete);
      if (!response.error) {
        setTimeSlots((prev) => prev.filter((s) => s.id !== selectedSlotId));
      } else {
        alert(response.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete failed', error);
    } finally {
      setIsDialogOpen(false);
      setSelectedSlotId(null);
      setPermanentDelete(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setSelectedSlotId(null);
    setPermanentDelete(false);
  };

  // Table columns
  const columns = [
    {
      key: 'sno',
      label: 'S.No',
      render: (_: TimeSlot, index: number) => startIndex + index + 1,
    },
    { key: 'label', label: 'Label' },
    { key: 'startTime', label: 'Start Time' },
    { key: 'endTime', label: 'End Time' },
    {
      key: 'status',
      label: 'Status',
      render: (slot: TimeSlot) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${slot.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
        <div className="flex justify-end gap-3 ">
          <Link href={`/setting/delivery-time-slots/edit/${slot.id}`}>
            <FilePenLine className="h-5 w-5 cursor-pointer" />
          </Link>
          <Trash2 className="h-5 w-5 cursor-pointer" onClick={() => handleDelete(slot.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-sidebar flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="w-full overflow-y-auto rounded p-4 shadow-lg">
        <div>
          {/* Header (Document Types style) */}
          <div className=" flex w-full items-center justify-between">
            <div className="flex items-center">
              <p className="text-lg font-bold">Delivery Time Slots</p>
            </div>

            <Link href="/delivery/time-slot-form">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Time Slot
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative my-4 w-full sm:w-1/3">
            <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search by label..."
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

        {/* Table */}
        <CommonTable
          columns={columns}
          data={currentSlots}
          emptyMessage={loading ? 'Loading...' : 'No Time Slots Found'}
        />

        {/* Pagination */}
        {filteredSlots.length > 0 && (
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCancelDelete} />

          <div className="relative z-10 w-11/12 max-w-md rounded bg-white p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold">Delete Time Slot</h3>
            <p className="mb-4 text-sm text-gray-700">Are you sure you want to delete this time slot?</p>

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

export default DeliveryTimeSlotList;
