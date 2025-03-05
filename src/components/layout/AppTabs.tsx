'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiBarChart2, FiPieChart } from 'react-icons/fi';

/**
 * Logger function for AppTabs component
 * @param action The action being performed
 * @param details Details about the action
 */
const logTabs = (action: string, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[AppTabs ${timestamp}]`, action, details || '');
};

/**
 * AppTabs component for navigation between different sections of the application
 * Currently supports 'Chart' and 'Stats' tabs
 */
export default function AppTabs() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine active tab based on the current path
  const isActive = (path: string) => pathname === path;
  
  const handleTabClick = (path: string) => {
    logTabs('Tab Clicked', { path });
    router.push(path);
  };
  
  return (
    <div className="flex bg-[#2A2E39] border-b border-gray-700">
      <div 
        className={`py-3 px-6 cursor-pointer flex items-center gap-2 ${
          isActive('/') ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'
        }`}
        onClick={() => handleTabClick('/')}
      >
        <FiBarChart2 size={16} />
        <span>Chart</span>
      </div>
      <div 
        className={`py-3 px-6 cursor-pointer flex items-center gap-2 ${
          isActive('/stats') ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'
        }`}
        onClick={() => handleTabClick('/stats')}
      >
        <FiPieChart size={16} />
        <span>Stats</span>
      </div>
    </div>
  );
} 