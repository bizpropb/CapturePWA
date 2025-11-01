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
      className="w-full py-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
    >
      <span className="flex items-center justify-center gap-3">
        <span className="text-3xl">📸</span>
        <span>Capture New Moment</span>
      </span>
    </Button>
  );
}
