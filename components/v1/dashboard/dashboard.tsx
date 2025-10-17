'use client';

import React from 'react';
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

export default function DashboardPage() {
  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between p-6 py-2 gap-4">
        <div className=''>
           <h4 className="text-xl font-semibold text-foreground">Dashboard</h4>
           <p>Quick Overview of current business performance</p>
        </div>

        <div className=''>
        {/* Filter Dropdown */} 
        <DateRangePicker/>
      </div>
      </div>

      {/* Cards Grid */}
      <div className="p-6 py-2 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Link href="/employee-management/employee-list">
        <DashboardCard
          title="Employees"
          value={125}
          subtitle="↑ 12% this month"
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        </Link>
        <Link href="/orders/order-list"> 
        <DashboardCard
          title="Orders"
          value={640}
          subtitle="↑ 8% vs last week"
          icon={<Package className="w-6 h-6" />}
          color="green"
        />
        </Link>
        <Link href="/delivery/delivery-assign">
        <DashboardCard
          title="Deliveries"
          value={580}
          subtitle="↓ 3% vs last month"
          icon={<Truck className="w-6 h-6" />}
          color="orange"
        />
        </Link>
        <Link href="/banner/banner-list">
        <DashboardCard
          title="Active Banners"
          value={5}
          icon={<Megaphone className="w-6 h-6" />} 
          color="purple"
        />
        </Link>
        <Link href="/offers/coupon-list">
        <DashboardCard
          title="Coupons & Offers"
          value={8}
          icon={<BadgePercent className="w-6 h-6" />}
          color="pink"
        />
        </Link>
        <Link href="/contact-support/contact-list">
        <DashboardCard
          title="Contact & Support"
          value={22}
          icon={<MessageCircle className="w-6 h-6" />}
          color="indigo"
        />
        </Link>
        <Link href="/customer">
        <DashboardCard
          title="Customers"
          value={122}
          icon={<Users className="w-6 h-6" />}
          color="indigo" />
        </Link>
        <Link href="">
        <DashboardCard
          title="Time Slots"
          value={122}
          icon={ <Timer className="w-6 h-6" />}
          color="indigo"
        />
        </Link>
      </div>
    </>
  );
}
