"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Eye, 
  Filter, 
  Calendar,
  Package,
  User,
  MapPin,
  Truck,
  X,
  Search
} from "lucide-react";
import CommonTable from "@/components/v1/common/common-table/common-table";
import { DateRangePicker } from "../../common/date_range";
import { DateRange } from "react-day-picker";

// Modal component for viewing order details
const OrderViewModal = ({ order, isOpen, onClose }: any) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="rounded-lg bg-sidebar max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Order Details - #{order.id}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full"
          >
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
                <p><span className="font-medium">Order ID:</span> #{order.id}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                    order.status === 'DELIVERED' ? ' text-primary' :
                    order.status === 'PENDING' ? ' text-primary' :
                    order.status === 'CANCELLED' ? ' text-primary' :
                    ' text-blue-800'
                  }`}>
                    {order.status}
                  </span>
                </p>
                <p><span className="font-medium">Type:</span> {order.isExpress ? 'Express' : 'Regular'}</p>
                <p><span className="font-medium">Order Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                <p><span className="font-medium">Total Value:</span> ₹{order.finalTotal}</p>
                <p><span className="font-medium">Items:</span> {order.totalItems}</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-primary">Customer Details</h3>
              </div>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Name:</span> {order.customerName}</p>
                <p><span className="font-medium">Phone:</span> {order.customerPhone}</p>
                <p><span className="font-medium">Address:</span> {order.customerAddress}</p>
                <p><span className="font-medium">Payment:</span> {order.paymentMethod}</p>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-primary">Delivery Details</h3>
              </div>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Partner:</span> {order.deliveryPartner || 'Not Assigned'}</p>
                <p><span className="font-medium">Time Slot:</span> {order.timeSlot || 'N/A'}</p>
                <p><span className="font-medium">Delivery Date:</span> {order.deliveredDate || 'Pending'}</p>
                <p><span className="font-medium">Instructions:</span> {order.instructions || 'None'}</p>
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
              {order.products?.map((product: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 rounded border">
                  <div>
                    <span className="font-medium">{product.label.split(' - ')[0]}</span>
                    {product.selectedVariant && (
                      <span className="ml-2 text-sm text-blue-600">({product.selectedVariant.name})</span>
                    )}
                    <div className="text-sm text-gray-500">
                      Qty: {product.quantity} × ₹{product.selectedVariant?.price || product.price}
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

export default function OrderList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const router = useRouter();

  // Load orders from localStorage
  useEffect(() => {
    const loadOrders = () => {
      try {
        const storedOrders = localStorage.getItem('orders');
        if (storedOrders) {
          const parsedOrders = JSON.parse(storedOrders);
          // Add sample delivery partner and delivered date for demo
          const ordersWithDeliveryInfo = parsedOrders.map((order: any) => ({
            ...order,
            deliveryPartner: order.status === 'DELIVERED' ? 'John Delivery' : 'Not Assigned',
            deliveredDate: order.status === 'DELIVERED' ? 
              new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString() : 
              null
          }));
          setOrders(ordersWithDeliveryInfo);
          setFilteredOrders(ordersWithDeliveryInfo);
        } else {
          // Sample data with various dates for testing
          const sampleOrders = [
            {
              id: Date.now().toString(),
              customerName: "John Doe",
              customerPhone: "9876543210",
              customerAddress: "123 Main St, City",
              paymentMethod: "COD",
              isExpress: true,
              timeSlot: "10:00-12:00",
              estimatedDeliveryDate: new Date().toISOString().split('T')[0],
              products: [
                {
                  label: "Dove Soap - Personal Care",
                  quantity: 2,
                  price: "45",
                  totalPrice: 90,
                  selectedVariant: { name: "75g Bar", price: "45" }
                }
              ],
              instructions: "Ring the doorbell",
              status: "PENDING",
              baseTotal: 90,
              discountAmount: 0,
              finalTotal: 90,
              totalItems: 2,
              createdAt: new Date().toISOString(),
              deliveryPartner: 'Not Assigned',
              deliveredDate: null
            },
            {
              id: (Date.now() + 1).toString(),
              customerName: "Jane Smith",
              customerPhone: "9123456789",
              customerAddress: "456 Oak Ave, City",
              paymentMethod: "CARD",
              isExpress: false,
              timeSlot: "14:00-16:00",
              estimatedDeliveryDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
              products: [
                {
                  label: "Colgate Toothpaste - Oral Care",
                  quantity: 1,
                  price: "65",
                  totalPrice: 65,
                }
              ],
              instructions: "",
              status: "DELIVERED",
              baseTotal: 65,
              discountAmount: 0,
              finalTotal: 65,
              totalItems: 1,
              createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
              deliveryPartner: 'John Delivery',
              deliveredDate: new Date().toLocaleDateString()
            },
            {
              id: (Date.now() + 2).toString(),
              customerName: "Mike Johnson",
              customerPhone: "9998887777",
              customerAddress: "789 Pine St, City",
              paymentMethod: "COD",
              isExpress: true,
              timeSlot: "10:00-12:00",
              estimatedDeliveryDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
              products: [
                {
                  label: "Lays Chips - Snacks",
                  quantity: 3,
                  price: "20",
                  totalPrice: 60,
                }
              ],
              instructions: "Call before delivery",
              status: "PROCESSING",
              baseTotal: 60,
              discountAmount: 0,
              finalTotal: 60,
              totalItems: 3,
              createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
              deliveryPartner: 'Not Assigned',
              deliveredDate: null
            }
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
    console.log("Filtering orders with:", { statusFilter, dateRange, searchTerm });
    let filtered = orders;

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date range filter
    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0); // Start of day
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0); // Start of day for comparison
        return orderDate >= fromDate;
      });
      
      console.log(`Filtered by from date: ${fromDate}, remaining orders:`, filtered.length);
    }
    
    if (dateRange?.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999); // End of day
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate <= toDate;
      });
      
      console.log(`Filtered by to date: ${toDate}, remaining orders:`, filtered.length);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm) ||
        order.customerPhone.includes(searchTerm)
      );
    }

    console.log("Final filtered orders:", filtered.length);
    setFilteredOrders(filtered);
  }, [orders, statusFilter, dateRange, searchTerm]);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleClearFilters = () => {
    setStatusFilter('ALL');
    setDateRange(undefined);
    setSearchTerm('');
  };

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    console.log("Date range changed to:", newDateRange);
    setDateRange(newDateRange);
  };

  const columns = [
    { 
      key: "sno", 
      label: "S.No", 
      render: (_item: any, index: number) => index + 1 
    },
    { 
      key: "id", 
      label: "Order ID",
      render: (item: any) => `#${item.id.toString().slice(-6)}`
    },
    { 
      key: "customerName", 
      label: "Customer Name"
    },
    {
      key: "totalItems",
      label: "Items Count",
      render: (item: any) => `${item.totalItems} items`
    },
    {
      key: "createdAt",
      label: "Order Date",
      render: (item: any) => new Date(item.createdAt).toLocaleDateString()
    },
    {
      key: "type",
      label: "Type",
      render: (item: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.isExpress ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {item.isExpress ? 'Express' : 'Regular'}
        </span>
      )
    },
    {
      key: "deliveredDate",
      label: "Delivered Date",
      render: (item: any) => item.deliveredDate || 'Pending'
    },
    {
      key: "finalTotal",
      label: "Order Value",
      render: (item: any) => `₹${item.finalTotal}`
    },
    {
      key: "status",
      label: "Status",
      render: (item: any) => (
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
          item.status === "DELIVERED" ? "bg-green-100 text-green-800" :
          item.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
          item.status === "PROCESSING" ? "bg-blue-100 text-blue-800" :
          item.status === "CANCELLED" ? "bg-red-100 text-red-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {item.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: any) => (
        <div className="flex justify-end gap-2">
          <Eye 
            className="w-5 cursor-pointer text-green-600 hover:text-green-800" 
            onClick={() => handleViewOrder(item)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center bg-sidebar p-4">
      <div className="w-full rounded-lg p-4 shadow-lg">
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
              <Button className="bg-primary text-background flex items-center gap-2 cursor-pointer">
                <Plus className="w-4 h-4" /> Create Order
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-sidebar cursor-pointer"
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <CommonTable 
            columns={columns} 
            data={filteredOrders} 
            emptyMessage="No orders found." 
          />
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
