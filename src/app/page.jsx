import { MainLayout, PageHeader } from '@/components/layout';
import SyncIndicator from '@/components/layout/SyncIndicator';
import DashboardContent from '@/components/dashboard/DashboardContent';

/**
 * Home/Dashboard Page
 * Server-side rendered dashboard with:
 * - Quick stats (total moments, photos, audio, videos)
 * - Recent moments (last 5)
 * - Quick capture button
 * - Today's date and motivational message
 * - Pull-to-refresh functionality
 * - Shake-to-refresh for supported devices
 *
 * This page uses SSR to fetch fresh data on every load
 */
export const dynamic = 'force-dynamic'; // Force SSR
export const revalidate = 0; // No caching

/**
 * Fetch dashboard data server-side
 */
async function getDashboardData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/stats/dashboard`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    return await response.json();
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    // Return empty data on error
    return {
      stats: {
        totalMoments: 0,
        photosCount: 0,
        audioCount: 0,
        videoCount: 0
      },
      recentMoments: []
    };
  }
}

export default async function Home() {
  // Fetch data server-side
  const { stats, recentMoments } = await getDashboardData();

  return (
    <MainLayout>
      <PageHeader
        title="Dashboard"
        description="Your moment-capturing hub"
        actions={
          <div className="flex items-center gap-3">
            <SyncIndicator />
          </div>
        }
      />

      {/* Dashboard content with pull-to-refresh */}
      <DashboardContent stats={stats} recentMoments={recentMoments} />
    </MainLayout>
  );
}
