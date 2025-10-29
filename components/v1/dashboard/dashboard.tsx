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
import { DashboardData } from '@/apis/auth.api';
import { format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { DashboardStatsData } from '@/interface/common.interface';



export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Set default date range to today
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return {
      from: today,
      to: today,
    };
  });

  // Fetch dashboard data
  // Fixed fetchData function
const fetchData = async (from: string, to: string) => {
  try {
    setLoading(true);
    
    const res = await DashboardData({ from, to });
    console.log("API response:", res);
    
    // Fix: Check for res.payload directly, not res.payload.data
    if (!res.error && res.payload) {
      setStats(res.payload);  // Set res.payload directly
    } else {
      console.error('Dashboard API returned error:', res.message);
      setStats(null);
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    setStats(null);
  } finally {
    setLoading(false);
  }
};


  // Auto-fetch when dateRange changes
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const from = format(dateRange.from, 'dd-MM-yyyy');
      const to = format(dateRange.to, 'dd-MM-yyyy');
      fetchData(from, to);
    }
  }, [dateRange]); // Add dateRange as dependency

  // Handle date range change - now triggers automatic fetch
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    // No need to manually call fetchData here - useEffect will handle it
  };

  // Handle apply button click - optional since auto-filtering is active
  const handleApplyDateRange = () => {
    if (dateRange?.from && dateRange?.to) {
      const from = format(dateRange.from, 'dd-MM-yyyy');
      const to = format(dateRange.to, 'dd-MM-yyyy');
      fetchData(from, to);
    }
  };

  // Handle clear button click
  const handleClearDateRange = () => {
    const today = new Date();
    const sevenDaysAgo = subDays(today, 7);
    const defaultRange = {
      from: sevenDaysAgo,
      to: today,
    };
    setDateRange(defaultRange);
    // useEffect will automatically call fetchData when dateRange changes
  };

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between p-6 py-2 gap-4">
        <div>
          <h4 className="text-xl font-semibold text-foreground">Dashboard</h4>
          {stats ? (
            <p className="text-gray-500 text-sm">
              Quick Overview of current business performance from {stats.filters.from} to{' '}
              {stats.filters.to}
            </p>
          ) : (
            <p className="text-gray-500 text-sm">
              Quick Overview of current business performance
            </p>
          )}
        </div>

        <div className="w-full sm:w-auto flex justify-center sm:justify-end">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            onApply={handleApplyDateRange}
            onClear={handleClearDateRange}
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="p-6 py-2 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          <p className="col-span-full text-center text-gray-500">Loading data...</p>
        ) : stats ? (
          <>
            <Link href="/employee-management/employee-list">
              <DashboardCard
                title="Employees"
                value={stats.employees}
                subtitle="↑ 12% this month"
                icon={<Users className="w-6 h-6" />}
                color="blue"
              />
            </Link>

            <Link href="/orders/order-list">
              <DashboardCard
                title="Orders"
                value={stats.orders}
                subtitle="↑ 8% vs last week"
                icon={<Package className="w-6 h-6" />}
                color="green"
              />
            </Link>

            <Link href="/delivery/delivery-assign">
              <DashboardCard
                title="Deliveries"
                value={stats.deliveries}
                subtitle="↓ 3% vs last month"
                icon={<Truck className="w-6 h-6" />}
                color="orange"
              />
            </Link>

            <Link href="/banner/banner-list">
              <DashboardCard
                title="Active Banners"
                value={stats.activeBanners}
                icon={<Megaphone className="w-6 h-6" />}
                color="purple"
              />
            </Link>

            <Link href="/offers/coupon-list">
              <DashboardCard
                title="Coupons & Offers"
                value={stats.couponsAndOffers}
                icon={<BadgePercent className="w-6 h-6" />}
                color="pink"
              />
            </Link>

            <Link href="/contact-support/contact-list">
              <DashboardCard
                title="Contact & Support"
                value={stats.contactAndSupport}
                icon={<MessageCircle className="w-6 h-6" />}
                color="indigo"
              />
            </Link>

            <Link href="/customer">
              <DashboardCard
                title="Customers"
                value={stats.customers}
                icon={<Users className="w-6 h-6" />}
                color="indigo"
              />
            </Link>

            <Link href="">
              <DashboardCard
                title="Time Slots"
                value={stats.timeSlots}
                icon={<Timer className="w-6 h-6" />}
                color="indigo"
              />
            </Link>
          </>
        ) : (
          <p className="col-span-full text-center text-red-500">No data available</p>
        )}
      </div>
    </>
  );
}
