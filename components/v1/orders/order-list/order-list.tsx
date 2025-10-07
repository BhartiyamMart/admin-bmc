"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle, Eye, XCircle } from "lucide-react";
import CommonTable from "@/components/v1/common/common-table/common-table";

export default function OrderList() {
  const [orders, setOrders] = useState([ 
    {
      id: 1,
      orderId: 1,
      customerName: "Anand",
      status: "active",
      createdAt: "04 oct 2025", 
    },
  ]);

  const router = useRouter();

  const handleMove = () => {
    router.push("/delivery/delivery-assign");
  };

  const columns = [
    { key: "sno", label: "S.No", render: (_item: any, index: number) => index + 1 },
    { key: "orderId", label: "OrderID" },
    { key: "customerName", label: "Customer Name" },
    {
      key: "status",
      label: "Status",
      render: (item: any) => (
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
    { key: "createdAt", label: "Created At" },
    {
      key: "actions",
      label: "Actions",
      render: () => (
        <div className="flex justify-end gap-2">
          <XCircle className="w-5 cursor-pointer text-red-600 hover:text-red-800" />
          <Eye className="w-5 cursor-pointer text-green-600 hover:text-green-800" />
          <CheckCircle
            onClick={handleMove}
            className="w-5 cursor-pointer text-blue-500 hover:text-blue-700"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen justify-center bg-gray-100 p-4">
      <div className="w-full rounded-lg bg-white p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-md font-semibold">Orders</p>
          <Link href="/orders/create-order">
            <Button className="bg-orange-400 hover:bg-orange-500 text-white flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Order
            </Button>
          </Link>
        </div>

        {/* Table */}
        <CommonTable columns={columns} data={orders} emptyMessage="No orders found." />
      </div>
    </div>
  );
}
