'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Package,
  Truck,
  BadgePercent,
  Megaphone,
  MessageCircle,
  Timer,
} from 'lucide-react';
import DashboardCard from '@/components/v1/card/cardDashboard';
import { DateRangePicker } from '../common/date_range';
import Link from 'next/link';
import { dashboardData } from '@/apis/auth.api'; // adjust path if needed

interface DashboardStats {
  totalEmployees: number;
  totalOrders: number;
  totalDeliveries: number;
  activeBanners: number;
  totalCoupons: number;
  totalSupport: number;
  totalCustomers: number;
  totalTimeSlots: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await dashboardData();
        if (res) {
          setStats(res.payload as unknown as DashboardStats); // Cast to unknown first, then DashboardStats
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 gap-3 sm:gap-4 flex-wrap">
      <div className="text-center sm:text-left">
        <h4 className="text-lg sm:text-xl font-semibold text-foreground">Dashboard</h4>
        <p className="text-sm sm:text-base text-muted-foreground">
          Quick overview of current business performance
        </p>
      </div>

      <div className="w-full sm:w-auto flex justify-center sm:justify-end">
        {/* Filter Dropdown */}
        <DateRangePicker />
      </div>
    </div>

      {/* Cards Grid */}
      <div className="p-6 py-2 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          <p className="col-span-full text-center text-gray-500">Loading data...</p>
        ) : (
          <>
            <Link href="/employee-management/employee-list">
              <DashboardCard
                title="Employees"
                value={stats?.totalEmployees ?? 0}
                subtitle="↑ 12% this month"
                icon={<Users className="w-6 h-6" />}
                color="blue"
              />
            </Link>

            <Link href="/orders/order-list">
              <DashboardCard
                title="Orders"
                value={stats?.totalOrders ?? 0}
                subtitle="↑ 8% vs last week"
                icon={<Package className="w-6 h-6" />}
                color="green"
              />
            </Link>

            <Link href="/delivery/delivery-assign">
              <DashboardCard
                title="Deliveries"
                value={stats?.totalDeliveries ?? 0}
                subtitle="↓ 3% vs last month"
                icon={<Truck className="w-6 h-6" />}
                color="orange"
              />
            </Link>

            <Link href="/banner/banner-list">
              <DashboardCard
                title="Active Banners"
                value={stats?.activeBanners ?? 0}
                icon={<Megaphone className="w-6 h-6" />}
                color="purple"
              />
            </Link>

            <Link href="/offers/coupon-list">
              <DashboardCard
                title="Coupons & Offers"
                value={stats?.totalCoupons ?? 0}
                icon={<BadgePercent className="w-6 h-6" />}
                color="pink"
              />
            </Link>

            <Link href="/contact-support/contact-list">
              <DashboardCard
                title="Contact & Support"
                value={stats?.totalSupport ?? 0}
                icon={<MessageCircle className="w-6 h-6" />}
                color="indigo"
              />
            </Link>

            <Link href="/customer">
              <DashboardCard
                title="Customers"
                value={stats?.totalCustomers ?? 0}
                icon={<Users className="w-6 h-6" />}
                color="indigo"
              />
            </Link>

            <Link href="">
              <DashboardCard
                title="Time Slots"
                value={stats?.totalTimeSlots ?? 0}
                icon={<Timer className="w-6 h-6" />}
                color="indigo"
              />
            </Link>
          </>
        )}
      </div>
    </>
  );
}
