"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Eye,
  X,
  Package,
  User,
  Truck,
  Search,
} from "lucide-react";
import CommonTable from "@/components/v1/common/common-table/common-table";
import { DateRangePicker } from "../../common/date_range";
import { DateRange } from "react-day-picker";

// --------------------
// Types
// --------------------

interface ProductVariant {
  name: string;
  price: string;
}

interface Product {
  label: string;
  quantity: number;
  price: string;
  totalPrice: number;
  selectedVariant?: ProductVariant;
}

interface Offer {
  title: string;
}

interface Coupon {
  title: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  isExpress: boolean;
  timeSlot: string;
  estimatedDeliveryDate: string;
  products: Product[];
  instructions: string;
  status: "PENDING" | "PROCESSING" | "DELIVERED" | "CANCELLED";
  baseTotal: number;
  discountAmount: number;
  finalTotal: number;
  totalItems: number;
  createdAt: string;
  deliveryPartner: string | null;
  deliveredDate: string | null;
  selectedOffer?: Offer;
  selectedCoupon?: Coupon;
}

interface OrderViewModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

// --------------------
// OrderViewModal Component
// --------------------

const OrderViewModal: React.FC<OrderViewModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="rounded-lg bg-sidebar max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Order Details - #{order.id}</h2>
          <button onClick={onClose} className="p-2 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 bg-sidebar">
          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-primary">Order Information</h3>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Order ID:</span> #{order.id}
                </p>
                <p>
                  <span className="font-medium">Status:</span>
                  <span
                    className={`ml-1 px-2 py-1 rounded-full text-xs ${
                      order.status === "DELIVERED"
                        ? "text-primary"
                        : "text-blue-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Type:</span>{" "}
                  {order.isExpress ? "Express" : "Regular"}
                </p>
                <p>
                  <span className="font-medium">Order Date:</span>{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Total Value:</span> ₹
                  {order.finalTotal}
                </p>
                <p>
                  <span className="font-medium">Items:</span>{" "}
                  {order.totalItems}
                </p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-primary">Customer Details</h3>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {order.customerName}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {order.customerPhone}
                </p>
                <p>
                  <span className="font-medium">Address:</span>{" "}
                  {order.customerAddress}
                </p>
                <p>
                  <span className="font-medium">Payment:</span>{" "}
                  {order.paymentMethod}
                </p>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-primary">Delivery Details</h3>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Partner:</span>{" "}
                  {order.deliveryPartner || "Not Assigned"}
                </p>
                <p>
                  <span className="font-medium">Time Slot:</span>{" "}
                  {order.timeSlot || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Delivery Date:</span>{" "}
                  {order.deliveredDate || "Pending"}
                </p>
                <p>
                  <span className="font-medium">Instructions:</span>{" "}
                  {order.instructions || "None"}
                </p>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="p-4 rounded-lg">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Package className="h-5 w-5 text-white" />
              Product Details
            </h3>
            <div className="space-y-2">
              {order.products?.map((product, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 rounded border"
                >
                  <div>
                    <span className="font-medium">
                      {product.label.split(" - ")[0]}
                    </span>
                    {product.selectedVariant && (
                      <span className="ml-2 text-sm text-blue-600">
                        ({product.selectedVariant.name})
                      </span>
                    )}
                    <div className="text-sm text-gray-500">
                      Qty: {product.quantity} × ₹
                      {product.selectedVariant?.price || product.price}
                    </div>
                  </div>
                  <div className="font-medium text-primary">
                    ₹{product.totalPrice}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{order.baseTotal}</span>
              </div>
              {order.selectedOffer && (
                <div className="flex justify-between text-green-600">
                  <span>Offer ({order.selectedOffer.title}):</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}
              {order.selectedCoupon && (
                <div className="flex justify-between text-blue-600">
                  <span>Coupon ({order.selectedCoupon.title}):</span>
                  <span>Applied</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Final Total:</span>
                <span className="text-green-600">₹{order.finalTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --------------------
// Main OrderList Component
// --------------------

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();

  // Load orders
  useEffect(() => {
    const storedOrders = localStorage.getItem("orders");
    if (storedOrders) {
      const parsed: Order[] = JSON.parse(storedOrders);
      setOrders(parsed);
      setFilteredOrders(parsed);
    }
  }, []);

  useEffect(() => {
    let filtered = [...orders];

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    if (dateRange?.from) {
      const from = new Date(dateRange.from);
      filtered = filtered.filter(
        (o) => new Date(o.createdAt) >= from
      );
    }

    if (dateRange?.to) {
      const to = new Date(dateRange.to);
      filtered = filtered.filter(
        (o) => new Date(o.createdAt) <= to
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (o) =>
          o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.id.includes(searchTerm) ||
          o.customerPhone.includes(searchTerm)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, dateRange, searchTerm]);

  const columns = [
    {
      key: "sno",
      label: "S.No",
      render: (_: Order, index: number) => index + 1,
    },
    { key: "id", label: "Order ID", render: (o: Order) => `#${o.id.slice(-6)}` },
    { key: "customerName", label: "Customer Name" },
    {
      key: "totalItems",
      label: "Items Count",
      render: (o: Order) => `${o.totalItems} items`,
    },
    {
      key: "createdAt",
      label: "Order Date",
      render: (o: Order) => new Date(o.createdAt).toLocaleDateString(),
    },
    {
      key: "finalTotal",
      label: "Order Value",
      render: (o: Order) => `₹${o.finalTotal}`,
    },
    {
      key: "status",
      label: "Status",
      render: (o: Order) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            o.status === "DELIVERED"
              ? "bg-green-100 text-green-800"
              : o.status === "PENDING"
              ? "bg-yellow-100 text-yellow-800"
              : o.status === "PROCESSING"
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {o.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (o: Order) => (
        <div className="flex justify-end gap-2">
          <Eye
            className="w-5 cursor-pointer text-green-600 hover:text-green-800"
            onClick={() => {
              setSelectedOrder(o);
              setIsViewModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen justify-center bg-sidebar p-4">
      <div className="w-full rounded-lg p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-lg font-semibold">Orders Management</p>
          <Link href="/orders/create-order">
            <Button className="bg-orange-400 hover:bg-orange-500 text-white flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Order
            </Button>
          </Link>
        </div>

        {/* Search + Filters */}
        <div className="mb-6 p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-sidebar"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <CommonTable columns={columns} data={filteredOrders} emptyMessage="No orders found." />
        </div>

        {/* View Modal */}
        <OrderViewModal
          order={selectedOrder}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedOrder(null);
          }}
        />
      </div>
    </div>
  );
}
