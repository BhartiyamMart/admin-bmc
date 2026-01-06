'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Package, User, Truck, X, Search } from 'lucide-react';
import CommonTable from '@/components/v1/common/common-table/common-table';
import { DateRangePicker } from '../../common/date_range';
import { DateRange } from 'react-day-picker';

// --- Type Definitions ---
interface Product {
  label: string;
  quantity: number;
  price: string | number;
  totalPrice: number;
  selectedVariant?: {
    name: string;
    price: string | number;
  };
}

interface Offer {
  title: string;
}

interface Coupon {
  title: string;
}

interface Order {
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
  status: 'PENDING' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';
  baseTotal: number;
  discountAmount: number;
  finalTotal: number;
  totalItems: number;
  createdAt: string;
  deliveryPartner?: string;
  deliveredDate?: string | null;
  selectedOffer?: Offer;
  selectedCoupon?: Coupon;
}

// Modal component for viewing order details
interface OrderViewModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderViewModal: React.FC<OrderViewModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-white/10">
      <div className="bg-sidebar max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded">
        <div className="bg-sidebar sticky top-0 flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold">Order Details - #{order.id}</h2>
          <button onClick={onClose} className="cursor-pointer rounded-full p-2">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-sidebar space-y-6 p-6">
          {/* Order Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded p-4">
              <div className="mb-2 flex items-center gap-2">
                <Package className="text-primary h-5 w-5" />
                <h3 className="text-primary font-medium">Order Information</h3>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Order ID:</span> #{order.id}
                </p>
                <p>
                  <span className="font-medium">Status:</span>
                  <span
                    className={`ml-1 rounded-full px-2 py-1 text-xs ${
                      order.status === 'DELIVERED'
                        ? 'text-primary'
                        : order.status === 'PENDING'
                          ? 'text-primary'
                          : order.status === 'CANCELLED'
                            ? 'text-primary'
                            : 'text-blue-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Type:</span> {order.isExpress ? 'Express' : 'Regular'}
                </p>
                <p>
                  <span className="font-medium">Order Date:</span> {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Total Value:</span> ₹{order.finalTotal}
                </p>
                <p>
                  <span className="font-medium">Items:</span> {order.totalItems}
                </p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="rounded p-4">
              <div className="mb-2 flex items-center gap-2">
                <User className="text-primary h-5 w-5" />
                <h3 className="text-primary font-medium">Customer Details</h3>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Name:</span> {order.customerName}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {order.customerPhone}
                </p>
                <p>
                  <span className="font-medium">Address:</span> {order.customerAddress}
                </p>
                <p>
                  <span className="font-medium">Payment:</span> {order.paymentMethod}
                </p>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="rounded p-4">
              <div className="mb-2 flex items-center gap-2">
                <Truck className="text-primary h-5 w-5" />
                <h3 className="text-primary font-medium">Delivery Details</h3>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Partner:</span> {order.deliveryPartner || 'Not Assigned'}
                </p>
                <p>
                  <span className="font-medium">Time Slot:</span> {order.timeSlot || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Delivery Date:</span> {order.deliveredDate || 'Pending'}
                </p>
                <p>
                  <span className="font-medium">Instructions:</span> {order.instructions || 'None'}
                </p>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="rounded p-4">
            <h3 className="mb-3 flex items-center gap-2 font-medium">
              <Package className="h-5 w-5 text-white" />
              Product Details
            </h3>
            <div className="space-y-2">
              {order.products?.map((product, index) => (
                <div key={index} className="flex items-center justify-between rounded border p-3">
                  <div>
                    <span className="font-medium">{product.label.split(' - ')[0]}</span>
                    {product.selectedVariant && (
                      <span className="ml-2 text-sm text-blue-600">({product.selectedVariant.name})</span>
                    )}
                    <div className="text-sm text-gray-500">
                      Qty: {product.quantity} × ₹{product.selectedVariant?.price || product.price}
                    </div>
                  </div>
                  <div className="text-primary font-medium">₹{product.totalPrice}</div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-4 space-y-2 border pt-4">
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
              <div className="flex justify-between border pt-2 text-lg font-bold">
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

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  // Load orders from localStorage
  useEffect(() => {
    const loadOrders = () => {
      try {
        const storedOrders = localStorage.getItem('orders');
        if (storedOrders) {
          const parsedOrders: Order[] = JSON.parse(storedOrders);
          // Add sample delivery partner and delivered date for demo
          const ordersWithDeliveryInfo = parsedOrders.map((order) => ({
            ...order,
            deliveryPartner: order.status === 'DELIVERED' ? 'John Delivery' : 'Not Assigned',
            deliveredDate:
              order.status === 'DELIVERED'
                ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
                : null,
          }));
          setOrders(ordersWithDeliveryInfo);
          setFilteredOrders(ordersWithDeliveryInfo);
        } else {
          // Sample data with various dates for testing
          const sampleOrders: Order[] = [
            {
              id: Date.now().toString(),
              customerName: 'John Doe',
              customerPhone: '9876543210',
              customerAddress: '123 Main St, City',
              paymentMethod: 'COD',
              isExpress: true,
              timeSlot: '10:00-12:00',
              estimatedDeliveryDate: new Date().toISOString().split('T')[0],
              products: [
                {
                  label: 'Dove Soap - Personal Care',
                  quantity: 2,
                  price: '45',
                  totalPrice: 90,
                  selectedVariant: { name: '75g Bar', price: '45' },
                },
              ],
              instructions: 'Ring the doorbell',
              status: 'PENDING',
              baseTotal: 90,
              discountAmount: 0,
              finalTotal: 90,
              totalItems: 2,
              createdAt: new Date().toISOString(),
              deliveryPartner: 'Not Assigned',
              deliveredDate: null,
            },
            {
              id: (Date.now() + 1).toString(),
              customerName: 'Jane Smith',
              customerPhone: '9123456789',
              customerAddress: '456 Oak Ave, City',
              paymentMethod: 'CARD',
              isExpress: false,
              timeSlot: '14:00-16:00',
              estimatedDeliveryDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
              products: [
                {
                  label: 'Colgate Toothpaste - Oral Care',
                  quantity: 1,
                  price: '65',
                  totalPrice: 65,
                },
              ],
              instructions: '',
              status: 'DELIVERED',
              baseTotal: 65,
              discountAmount: 0,
              finalTotal: 65,
              totalItems: 1,
              createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
              deliveryPartner: 'John Delivery',
              deliveredDate: new Date().toLocaleDateString(),
            },
            {
              id: (Date.now() + 2).toString(),
              customerName: 'Mike Johnson',
              customerPhone: '9998887777',
              customerAddress: '789 Pine St, City',
              paymentMethod: 'COD',
              isExpress: true,
              timeSlot: '10:00-12:00',
              estimatedDeliveryDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
              products: [
                {
                  label: 'Lays Chips - Snacks',
                  quantity: 3,
                  price: '20',
                  totalPrice: 60,
                },
              ],
              instructions: 'Call before delivery',
              status: 'PROCESSING',
              baseTotal: 60,
              discountAmount: 0,
              finalTotal: 60,
              totalItems: 3,
              createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
              deliveryPartner: 'Not Assigned',
              deliveredDate: null,
            },
          ];
          setOrders(sampleOrders);
          setFilteredOrders(sampleOrders);
        }
      } catch (error) {
        console.error('Error loading orders:', error);
      }
    };

    loadOrders();
  }, []);

  // Filter orders based on filters
  useEffect(() => {
    let filtered = orders;

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Date range filter
    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0); // Start of day

      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0); // Start of day for comparison
        return orderDate >= fromDate;
      });
    }

    if (dateRange?.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999); // End of day

      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate <= toDate;
      });
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id.toString().includes(searchTerm) ||
          order.customerPhone.includes(searchTerm)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, dateRange, searchTerm]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleClearFilters = () => {
    setStatusFilter('ALL');
    setDateRange(undefined);
    setSearchTerm('');
  };

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };

  const columns = [
    {
      key: 'sno',
      label: 'S.No',
      render: (_item: Order, index: number) => index + 1,
    },
    {
      key: 'id',
      label: 'Order ID',
      render: (item: Order) => `#${item.id.toString().slice(-6)}`,
    },
    {
      key: 'customerName',
      label: 'Customer Name',
    },
    {
      key: 'totalItems',
      label: 'Items Count',
      render: (item: Order) => `${item.totalItems} items`,
    },
    {
      key: 'createdAt',
      label: 'Order Date',
      render: (item: Order) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      key: 'type',
      label: 'Type',
      render: (item: Order) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            item.isExpress ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
          }`}
        >
          {item.isExpress ? 'Express' : 'Regular'}
        </span>
      ),
    },
    {
      key: 'deliveredDate',
      label: 'Delivered Date',
      render: (item: Order) => item.deliveredDate || 'Pending',
    },
    {
      key: 'finalTotal',
      label: 'Order Value',
      render: (item: Order) => `₹${item.finalTotal}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Order) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            item.status === 'DELIVERED'
              ? 'bg-green-100 text-green-800'
              : item.status === 'PENDING'
                ? 'bg-yellow-100 text-yellow-800'
                : item.status === 'PROCESSING'
                  ? 'bg-blue-100 text-blue-800'
                  : item.status === 'CANCELLED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Order) => (
        <div className="mr-2 flex justify-end gap-2">
          <Eye className="text-primary w-5 cursor-pointer" onClick={() => handleViewOrder(item)} />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-sidebar flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="w-full rounded p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-lg font-semibold">Orders Management</p>
          <div className="flex gap-2">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
              onClear={() => setDateRange(undefined)}
            />
            <Link href="/orders/create-order">
              <Button className="bg-primary text-background flex cursor-pointer items-center gap-2">
                <Plus className="h-4 w-4" /> Create Order
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}

            <Search className="text-primary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:border-primary w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none sm:w-1/3"
            />

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-sidebar focus:border-primary w-full cursor-pointer rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none sm:w-1/5"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Active Filters Count */}
          {(statusFilter !== 'ALL' || dateRange || searchTerm) && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {filteredOrders.length} of {orders.length} orders shown
              </span>
              <Button variant="outline" size="sm" onClick={handleClearFilters} className="text-xs">
                Clear All Filters
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded border">
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
