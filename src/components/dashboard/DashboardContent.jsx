'use client';

import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import {
  DashboardStats,
  QuickCaptureButton,
  WelcomeSection,
  DashboardClient,
  PullToRefreshWrapper
} from '@/components/dashboard';
import { Skeleton } from '@/components/ui';

/**
 * DashboardContent Component
 * Client wrapper for dashboard with pull-to-refresh
 */
export default function DashboardContent({ stats, recentMoments }) {
  const router = useRouter();

  const handleRefresh = async () => {
    // Trigger a router refresh to re-fetch SSR data
    router.refresh();
    // Small delay to ensure data is refreshed
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome section with date and motivational message */}
        <WelcomeSection />

        {/* Quick stats grid */}
        <div className="mb-8">
          <Suspense fallback={<Skeleton className="h-32" />}>
            <DashboardStats stats={stats} />
          </Suspense>
        </div>

        {/* Quick capture button */}
        <div className="mb-8">
          <QuickCaptureButton />
        </div>

        {/* Recent moments with client-side interactivity */}
        <DashboardClient initialMoments={recentMoments} />
      </div>
    </PullToRefreshWrapper>
  );
}
