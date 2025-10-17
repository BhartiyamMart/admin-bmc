"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FilePenLine, Plus, Trash2 } from "lucide-react";
import CommonTable from "@/components/v1/common/common-table/common-table";
import { useDeliveryAssignStore } from "@/store/deliveryAssignStore";
import type { Column, DeliveryAssign } from "@/interface/common.interface"; // Adjust if needed


const DeliveryAssignList = () => {
  const assigns = useDeliveryAssignStore((state) => state.assigns) as DeliveryAssign[];

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredAssigns = useMemo(() => {
    return assigns.filter((a) => {
      const matchesSearch =
        a.orderId.toString().includes(searchTerm) ||
        a.deliveryPartnerId.toString().includes(searchTerm);

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "completed"
          ? a.status === "completed"
          : a.status !== "completed";

      return matchesSearch && matchesStatus;
    });
  }, [assigns, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredAssigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAssigns = filteredAssigns.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  // ✅ 2. Strongly typed columns
  const columns: Column<DeliveryAssign>[] = [
    { key: "orderId", label: "Order ID" },
    { key: "deliveryPartnerId", label: "Partner ID" },
    { key: "status", label: "Status" },
    {
      key: "distance",
      label: "Distance",
      render: (a) => `${a.distance} km`,
    },
    { key: "otp", label: "OTP" },
    { key: "coinsEarned", label: "Coins" },
    {
      key: "actions",
      label: "Action",
      render: () => (
        <div className="flex justify-end gap-2 pr-4">
          <FilePenLine className="cursor-pointer w-5 text-blue-600" />
          <Trash2 className="cursor-pointer w-5 text-red-600" />
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen justify-center bg-sidebar p-4">
      <div className="w-full max-h-[89vh] overflow-y-auto rounded-lg  p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between">
          <p className="text-md font-semibold">Delivery Assignments</p>
          <Link href="/delivery/add-delivery-assign">
            <Button className="bg-primary text-background flex items-center gap-2">
              <Plus className="w-4 h-4" /> Assign Delivery
            </Button>
          </Link>
        </div>

        {/* Search + Filter */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <input
            type="text"
            placeholder="Search by Order ID or Partner ID..."
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
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* ✅ Table */}
        <CommonTable<DeliveryAssign>
          columns={columns}
          data={currentAssigns}
          emptyMessage="No delivery assignments found."
        />

        {/* Pagination */}
        {filteredAssigns.length > 0 && (
          <div className="mt-4 flex w-[30%] float-end justify-between items-center">
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
  );
};

export default DeliveryAssignList;
