'use client';

import React, { useEffect, useState } from 'react';
import { Users, Package, Truck, BadgePercent, Megaphone, MessageCircle, Timer } from 'lucide-react';
import DashboardCard from '@/components/v1/card/cardDashboard';
import Link from 'next/link';
import { DashboardData } from '@/apis/auth.api';
import { format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { DashboardStatsData } from '@/interface/common.interface';
import { DateRangePicker } from '@/components/common/date_range';

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
  const fetchData = async (from: string, to: string) => {
    try {
      setLoading(true);
      const res = await DashboardData({ from, to });
      console.log('API response:', res);
      console.log('Payload:', res.payload);

      if (!res.error && res.payload) {
        const data = res.payload as unknown as DashboardStatsData;
        setStats(data);
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

  // ❌ REMOVE THIS useEffect - It auto-triggers on dateRange change
  // useEffect(() => {
  //   if (dateRange?.from && dateRange?.to) {
  //     const from = format(dateRange.from, 'dd-MM-yyyy');
  //     const to = format(dateRange.to, 'dd-MM-yyyy');
  //     fetchData(from, to);
  //   }
  // }, [dateRange]);

  // ✅ ADD: Initial load on component mount
  useEffect(() => {
    const today = new Date();
    const from = format(today, 'dd-MM-yyyy');
    const to = format(today, 'dd-MM-yyyy');
    fetchData(from, to);
  }, []); // Empty array = runs only once on mount

  // Handle date range change (only updates state, doesn't call API)
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  // ✅ This now triggers the API call
  const handleApplyDateRange = () => {
    if (dateRange?.from && dateRange?.to) {
      const from = format(dateRange.from, 'dd-MM-yyyy');
      const to = format(dateRange.to, 'dd-MM-yyyy');
      fetchData(from, to);
    }
  };

  const handleClearDateRange = () => {
    const today = new Date();
    const sevenDaysAgo = subDays(today, 7);
    const defaultRange = { from: sevenDaysAgo, to: today };
    setDateRange(defaultRange);
    // Optionally fetch with cleared range immediately
    // fetchData(format(sevenDaysAgo, 'dd-MM-yyyy'), format(today, 'dd-MM-yyyy'));
  };

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col items-center justify-between gap-4 p-6 py-2 md:flex-row">
        <div>
          <h4 className="text-foreground text-xl font-semibold">Dashboard</h4>
        </div>

        <div className="flex w-full justify-center sm:w-auto sm:justify-end">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            onApply={handleApplyDateRange}
            onClear={handleClearDateRange}
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 p-6 py-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          <p className="col-span-full text-center text-gray-500">Loading data...</p>
        ) : stats ? (
          <>
            <Link href="/employee-management/employee-list">
              <DashboardCard
                title="Employees"
                value={stats.employees.count}
                subtitle={`Change: ${stats.employees.change}`}
                icon={<Users className="h-6 w-6" />}
                color="blue"
              />
            </Link>

            <Link href="/orders/order-list">
              <DashboardCard
                title="Orders"
                value={stats.orders.count}
                subtitle={`Change: ${stats.orders.change}`}
                icon={<Package className="h-6 w-6" />}
                color="green"
              />
            </Link>

            <Link href="/delivery/delivery-assign">
              <DashboardCard
                title="Deliveries"
                value={stats.deliveries.count}
                subtitle={`Change: ${stats.deliveries.change}`}
                icon={<Truck className="h-6 w-6" />}
                color="orange"
              />
            </Link>

            <Link href="/banner/banner-list">
              <DashboardCard
                title="Active Banners"
                value={stats.activeBanners}
                icon={<Megaphone className="h-6 w-6" />}
                color="purple"
              />
            </Link>

            <Link href="/offers/coupon-list">
              <DashboardCard
                title="Coupons & Offers"
                value={stats.couponsAndOffers}
                icon={<BadgePercent className="h-6 w-6" />}
                color="pink"
              />
            </Link>

            <Link href="/contact-support/contact-list">
              <DashboardCard
                title="Contact & Support"
                value={stats.contactAndSupport}
                icon={<MessageCircle className="h-6 w-6" />}
                color="indigo"
              />
            </Link>

            <Link href="customer/customer-list">
              <DashboardCard
                title="Customers"
                value={stats.customers}
                icon={<Users className="h-6 w-6" />}
                color="indigo"
              />
            </Link>

            <Link href="">
              <DashboardCard
                title="Time Slots"
                value={stats.timeSlots}
                icon={<Timer className="h-6 w-6" />}
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
