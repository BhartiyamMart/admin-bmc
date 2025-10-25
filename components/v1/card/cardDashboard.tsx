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
      className="relative overflow-hidden rounded-2xl bg-sidebar shadow-sm backdrop-blur-md hover:shadow-md 
                 flex flex-col justify-between h-full min-h-[150px]"
    >
      {/* Card Content */}
      <div className="p-5 flex justify-between  flex-1">
        <div>
          <h3 className="text-sm font-semibold text-primary">{title}</h3>
          <p className="text-3xl font-bold text-primary mt-1">{value}</p>
        </div>

        <div
          className={`w-12 h-12 flex items-center justify-center rounded-xl 
                      bg-${color}-50 text-${color}-600 shadow-inner`}
        >
          {icon}
        </div>
      </div>

      {/* Subtitle Section */}
      {subtitle && (
        <p className="text-xs bg-primary text-background mx-auto px-3 py-1.5 
                      rounded-xl mb-3 w-[90%]">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default DashboardCard;
