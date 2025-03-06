'use client';

import AppTabs from '@/components/layout/AppTabs';

/**
 * Minimal placeholder for Stats page
 */
export default function StatsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#1E222D] text-white">
      <AppTabs />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Trading Statistics</h1>
        <p className="text-gray-300">
          No sample data is provided. Integrate your real crypto stats here.
        </p>
      </main>
    </div>
  );
} 