"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import * as Icon from "lucide-react";
import CommonTable from "@/components/v1/common/common-table/common-table";

// ✅ Type Definitions
interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
  status: "active" | "inactive";
}

interface Column<T> {
  key: keyof T | "sno" | "actions";
  label: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export default function CustomerList() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 1,
      name: "Anand",
      phone: "9876543210",
      email: "anand@example.com",
      createdAt: "04 Oct 2025",
      status: "active",
    },
  ]);

  const columns: Column<Customer>[] = [
    {
      key: "sno",
      label: "S.No",
      render: (_item, index) => index + 1,
    },
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone No." },
    { key: "email", label: "Email" },
    { key: "createdAt", label: "Created At" },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            item.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div className="flex justify-end gap-2">
          <Icon.Eye
            className="w-5 cursor-pointer text-blue-500 hover:text-blue-700"
            onClick={() => router.push(`/customer/view/${item.id}`)}
          />
          <Icon.XCircle className="w-5 cursor-pointer text-red-600 hover:text-red-800" />
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen justify-center  p-4">
      <div className="w-full rounded-lg bg-sidebar p-4 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-md font-semibold flex items-center gap-2">
            <Icon.Users className="w-5 h-5 text-white" />
            Customers
          </p>
          
        </div>

        <CommonTable
          columns={columns}
          data={customers}
          emptyMessage="No customers found."
        />
      </div>
    </div>
  );
}
