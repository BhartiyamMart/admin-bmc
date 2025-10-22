"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FilePenLine, Plus, Trash2 } from "lucide-react";
import CommonTable from "@/components/v1/common/common-table/common-table";
import { useDeliverySlotStore } from "@/store/deliverySlotStore";

interface DeliverySlot {
  id: number;
  label: string;
  startTime: string;
  endTime: string;
  status: boolean;
  sortOrder: number;
}

const DeliveryTimeSlotList = () => {
  const slots = useDeliverySlotStore((state) => state.slots) as DeliverySlot[];
  const toggleStatus = useDeliverySlotStore((state) => state.toggleStatus);
  const removeSlot = useDeliverySlotStore((state) => state.removeSlot);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const matchesSearch = slot.label.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? slot.status === true
          : slot.status === false;

      return matchesSearch && matchesStatus;
    });
  }, [slots, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredSlots.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSlots = filteredSlots.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const columns = [
    { key: "label", label: "Label" },
    { key: "startTime", label: "Start Time" },
    { key: "endTime", label: "End Time" },
    {
      key: "status",
      label: "Status",
      render: (slot: DeliverySlot) => (
        <button
          onClick={() => toggleStatus(slot.id)}
          className={`px-3 py-1 rounded text-white text-sm ${
            slot.status ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {slot.status ? "Active" : "Inactive"}
        </button>
      ),
    },
    { key: "sortOrder", label: "Sort Order" },
    {
      key: "actions",
      label: "Actions",
      render: (slot: DeliverySlot) => (
        <div className="flex justify-end gap-2 pr-4">
          <FilePenLine className="cursor-pointer w-5 text-blue-600" />
          <Trash2
            className="cursor-pointer w-5 text-red-600"
            onClick={() => removeSlot(slot.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center bg-sidebar p-4">
      <div className="w-full overflow-y-auto rounded-lg  p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between">
          <p className="text-md font-semibold">Delivery Time Slots</p>
          <Link href="/delivery/add-delivery-time-slot">
            <Button className="bg-primary text-background flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Slot
            </Button>
          </Link>
        </div>

        {/* Search + Filter */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <input
            type="text"
            placeholder="Search by label..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-1/3 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-1/6 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="min-w-[300px] w-full sm:w-[560px]  md:w-[640px] lg:w-[900px] xl:w-[1100px]  min-w-full">

        {/* Table */}
        <CommonTable<DeliverySlot>
          columns={columns}
          data={currentSlots}
          emptyMessage="No time slots found."
        />

        {/* Pagination */}
        {filteredSlots.length > 0 && (
          <div className="mt-4 flex float-end justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`rounded-md border px-3 py-1 ${
                currentPage === 1
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-primary hover:text-white"
              }`}
            >
              Previous
            </button>
            <span className="font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`rounded-md border px-3 py-1 ${
                currentPage === totalPages
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-primary hover:text-white"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default DeliveryTimeSlotList;
