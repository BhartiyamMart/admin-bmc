import React from 'react';
import DashboardCard from '@/components/v1/card/cardDashboard';
import { Users, Package, Truck, BadgePercent, Megaphone, MessageCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="p-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <DashboardCard
        title="Total Employees"
        value={125}
        subtitle="↑ 12% this month"
        icon={<Users className="w-6 h-6" />}
        color="blue"
      />
      <DashboardCard
        title="Total Orders"
        value={640}
        subtitle="↑ 8% vs last week"
        icon={<Package className="w-6 h-6" />}
        color="green"
      />
      <DashboardCard
        title="Total Deliveries"
        value={580}
        subtitle="↓ 3% vs last month"
        icon={<Truck className="w-6 h-6" />}
        color="orange"
      />
      <DashboardCard
        title="Active Banners"
        value={5}
        icon={<Megaphone className="w-6 h-6" />}
        color="purple"
      />
      <DashboardCard
        title="Active Coupons"
        value={8}
        icon={<BadgePercent className="w-6 h-6" />}
        color="pink"
      />
      <DashboardCard
        title="Contact & Support"
        value={22}
        icon={<MessageCircle className="w-6 h-6" />}
        color="indigo"
      />
    </div>
  );
}
