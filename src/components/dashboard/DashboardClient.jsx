'use client';

import { useState, useEffect } from 'react';
import { syncPendingMoments } from '@/lib/db';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useAutoBadge } from '@/hooks/useBadge';
import { useShakeToRefresh } from '@/hooks/useShakeToRefresh';
import { useRouter } from 'next/navigation';
import MomentList from '@/components/moments/MomentList';
import EditModal from '@/components/moments/EditModal';

/**
 * DashboardClient Component
 * Handles interactive features for the dashboard:
 * - Recent moments display
 * - Sync management
 * - Shake to refresh
 * - Edit/Delete actions
 */
export default function DashboardClient({ initialMoments }) {
  const router = useRouter();
  const [moments, setMoments] = useState(initialMoments);
  const [editingMoment, setEditingMoment] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isOnline = useOnlineStatus();

  // Automatically manage app badge based on pending moments count
  useAutoBadge([syncing]);

  // Shake to refresh functionality
  const shake = useShakeToRefresh(async () => {
    setRefreshing(true);
    // Refresh by revalidating the page
    router.refresh();
    // Show feedback for a moment
    setTimeout(() => setRefreshing(false), 1000);
  });

  // Sync pending moments when coming back online
  useEffect(() => {
    const syncWhenOnline = async () => {
      if (isOnline && !syncing) {
        setSyncing(true);
        try {
          const syncedCount = await syncPendingMoments();
          if (syncedCount > 0) {
            // Refresh the page to get updated data
            router.refresh();
          }
        } catch (err) {
          console.error('Sync failed:', err);
        } finally {
          setSyncing(false);
        }
      }
    };

    syncWhenOnline();
  }, [isOnline, router]);

  // Update local state when initialMoments changes (after SSR refresh)
  useEffect(() => {
    setMoments(initialMoments);
  }, [initialMoments]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this moment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/moments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('Failed to delete moment');
      }

      // Remove moment from list and refresh
      setMoments(moments.filter((m) => m.id !== id));
      router.refresh();
    } catch (err) {
      alert('Error deleting moment: ' + err.message);
    }
  };

  const handleEdit = (moment) => {
    setEditingMoment(moment);
  };

  const handleSave = (updatedMoment) => {
    // Update moment in list
    setMoments(moments.map((m) => (m.id === updatedMoment.id ? updatedMoment : m)));
    router.refresh();
  };

  const handleCloseModal = () => {
    setEditingMoment(null);
  };

  return (
    <>
      {/* Shake-to-refresh indicator */}
      {(shake.isShaking || refreshing) && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <span className="text-xl">🔄</span>
          <span className="font-semibold">Refreshing...</span>
        </div>
      )}

      {/* Recent moments section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Recent Moments</h3>
          {/* Timeline page coming in Phase 3.4 */}
          {/* <button
            onClick={() => router.push('/timeline')}
            className="text-sm text-blue-400 hover:text-blue-300 transition"
          >
            View All →
          </button> */}
        </div>

        {moments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">No moments yet</p>
            <p className="text-sm">Start capturing your memories!</p>
          </div>
        ) : (
          <MomentList
            moments={moments}
            loading={false}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
      </div>

      {/* Edit modal */}
      {editingMoment && (
        <EditModal
          moment={editingMoment}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </>
  );
}
