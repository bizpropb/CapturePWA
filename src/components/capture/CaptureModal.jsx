'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import MomentForm from '@/components/capture/MomentForm';
import { useRouter } from 'next/navigation';

/**
 * Capture Modal
 * Modal for creating new moments
 * Max width: 720px with responsive margins
 */
export default function CaptureModal({ isOpen, onClose, sharedData = null }) {
  const router = useRouter();

  const handleSuccess = () => {
    onClose();
    // Refresh the current page data
    router.refresh();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create a Moment"
      maxWidth="720px"
    >
      <MomentForm
        onSuccess={handleSuccess}
        onCancel={onClose}
        initialData={sharedData}
      />
    </Modal>
  );
}
