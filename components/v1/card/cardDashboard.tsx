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

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title,
  value,
  icon,
  subtitle,
  color = 'blue',
}) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl border border-gray-100 bg-sidebar shadow-sm backdrop-blur-md hover:shadow-md"
    >
      {/* Accent bar */}
      <div
        className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-${color}-500 to-${color}-400`}
      />

      {/* Card Content */}
      <div className="p-5 flex justify-between items-center"> 
        <div>
          <h3 className="text-sm font-semibold text-primary">{title}</h3>
          <p className="text-3xl font-bold text-primary mt-1">{value}</p>
          {subtitle && <p className="text-xs text-primary mt-1">{subtitle}</p>}
        </div>

        <div
          className={`w-12 h-12 flex items-center justify-center rounded-xl bg-${color}-50 text-${color}-600 shadow-inner`}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardCard;
