'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

/**
 * QuickCaptureButton Component
 * Large, prominent button to quickly navigate to the capture page
 */
export default function QuickCaptureButton() {
  const router = useRouter();

  const handleCapture = () => {
    router.push('/capture');
  };

  return (
    <Button
      onClick={handleCapture}
      variant="primary"
      fullWidth
      className="py-6 text-lg font-semibold"
    >
      <span className="flex items-center justify-center gap-3">
        <span className="text-3xl">📸</span>
        <span>Capture New Moment</span>
      </span>
    </Button>
  );
}
