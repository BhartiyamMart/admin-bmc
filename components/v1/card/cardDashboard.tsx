'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle?: string;
  color?: string; // e.g. blue, green, purple etc.
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, subtitle, color = 'blue' }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="bg-sidebar relative flex h-full min-h-[150px] flex-col justify-between overflow-hidden rounded-2xl shadow-sm backdrop-blur-md hover:shadow-md "
    >
      {/* Card Content */}
      <div className="flex flex-1 justify-between p-5">
        <div>
          <h3 className="text-primary text-sm font-semibold">{title}</h3>
          <p className="text-primary mt-1 text-3xl font-bold">{value}</p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${color}-50 text-${color}-600 shadow-inner`}
        >
          {icon}
        </div>
      </div>

      {/* Subtitle Section */}
      {subtitle && (
        <p className="bg-primary text-background mx-auto mb-3 w-[90%] rounded-xl px-3 py-1.5 text-xs">{subtitle}</p>
      )}
    </motion.div>
  );
};

export default DashboardCard;
