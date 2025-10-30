'use client';

import { useState, useEffect } from 'react';
import { fetchMoments as fetchMomentsAPI } from '@/lib/api';
import { syncPendingMoments } from '@/lib/db';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { MainLayout, PageHeader, StatusIndicator } from '@/components/layout';
import MomentForm from '@/components/capture/MomentForm';
import MomentList from '@/components/moments/MomentList';
import EditModal from '@/components/moments/EditModal';

export default function Home() {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingMoment, setEditingMoment] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const isOnline = useOnlineStatus();

  // Fetch moments on mount
  useEffect(() => {
    fetchMoments();
  }, []);

  // Sync pending moments when coming back online
  useEffect(() => {
    const syncWhenOnline = async () => {
      if (isOnline && !syncing) {
        setSyncing(true);
        try {
          const syncedCount = await syncPendingMoments();
          if (syncedCount > 0) {
            // Refresh moments list after sync
            await fetchMoments();
          }
        } catch (err) {
          console.error('Sync failed:', err);
        } finally {
          setSyncing(false);
        }
      }
    };

    syncWhenOnline();
  }, [isOnline]);

  const fetchMoments = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchMomentsAPI();
      setMoments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMomentCreated = (newMoment) => {
    // Add new moment to the top of the list
    setMoments([newMoment, ...moments]);
  };

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

      // Remove moment from list
      setMoments(moments.filter((m) => m.id !== id));
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
  };

  const handleCloseModal = () => {
    setEditingMoment(null);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <PageHeader
          title="Dashboard"
          description="Quick overview and capture"
          actions={<StatusIndicator syncing={syncing} />}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Form (60%) */}
          <div className="w-full lg:w-[60%]">
            <MomentForm onMomentCreated={handleMomentCreated} />
          </div>

          {/* Right Column - Moments List (40%) */}
          <div className="w-full lg:w-[40%]">
            {error && (
              <div className="mb-4 p-4 bg-red-900 border border-red-700 text-red-200 rounded">
                Error: {error}
              </div>
            )}

            <MomentList
              moments={moments}
              loading={loading}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </div>
        </div>

        {editingMoment && (
          <EditModal
            moment={editingMoment}
            onClose={handleCloseModal}
            onSave={handleSave}
          />
        )}
      </div>
    </MainLayout>
  );
}
