"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, FilePenLine, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CommonTable from "@/components/v1/common/common-table/common-table";
import { getAllCustomers } from "@/apis/create-customer.api";

// ✅ Define a strict Customer interface
interface Customer {
  id: string;
  phoneNumber: string;
  status: "ACTIVE" | "INACTIVE";
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  createdAt: string;
}

// ✅ Define API response type
interface CustomerApiResponse {
  error: boolean;
  status: number;
  message: string;
  payload: Customer[];
}

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // 🧩 Fetch customers from API
  const fetchCustomers = async () => {
    try {
      const res = await getAllCustomers();
      if (!res.error && Array.isArray(res.payload)) {
        setCustomers(res.payload);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setCustomers([]);
    }
  };

  // 🕒 Fetch initially and refresh every 5 seconds
  useEffect(() => {
    fetchCustomers();
    const interval = setInterval(fetchCustomers, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🔍 Filter + Search logic
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const fullName = `${cust.firstName ?? ""} ${cust.lastName ?? ""}`.trim().toLowerCase();

      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        cust.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cust.email ?? "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? cust.status === "ACTIVE"
          : cust.status === "INACTIVE";

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  // 📊 Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  // 🧭 Pagination controls
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // ✅ Typed table columns
  const columns: {
    key: keyof Customer | "sno" | "actions";
    label: string;
    render?: (row: Customer, index: number) => React.ReactNode;
  }[] = [
    {
      key: "sno",
      label: "S.No",
      render: (_row, index) => startIndex + index + 1,
    },
    {
      key: "firstName",
      label: "Name",
      render: (cust) => `${cust.firstName ?? ""} ${cust.lastName ?? ""}`.trim() || "-",
    },
    {
      key: "phoneNumber",
      label: "Phone Number",
      render: (cust) => cust.phoneNumber ?? "-",
    },
    {
      key: "email",
      label: "Email",
      render: (cust) => cust.email ?? "-",
    },
    {
      key: "status",
      label: "Status",
      render: (cust) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            cust.status === "ACTIVE"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {cust.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (cust) =>
        new Date(cust.createdAt).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },
    {
      key: "actions",
      label: "Actions",
      render: (cust) => (
        <div className="flex justify-end gap-2 pr-4">
          <FilePenLine
            className="cursor-pointer w-5 text-primary"
            onClick={() => console.log("Edit:", cust.id)}
          />
          <Trash2
            className="cursor-pointer w-5 text-destructive"
            onClick={() => console.log("Delete:", cust.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="w-full rounded-lg bg-sidebar p-4 shadow-lg">
        {/* Header */}
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
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
              setStatusFilter(e.target.value as "all" | "active" | "inactive");
              setCurrentPage(1);
            }}
            className="w-full sm:w-1/6 rounded-md border bg-sidebar border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <CommonTable
          columns={columns}
          data={currentCustomers}
          emptyMessage="No customers found."
        />

        {/* Pagination */}
        {filteredCustomers.length > 0 && (
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

export default CustomerList;
