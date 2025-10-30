/**
 * Reusable Skeleton component
 * Loading placeholder with shimmer animation
 */

export default function Skeleton({
  width = 'w-full',
  height = 'h-4',
  className = '',
  variant = 'default',
}) {
  const variants = {
    default: 'rounded',
    circle: 'rounded-full',
    rect: 'rounded-lg',
  };

  return (
    <div
      className={`bg-gray-700 animate-pulse ${width} ${height} ${variants[variant]} ${className}`}
    />
  );
}

/**
 * Skeleton group for common loading patterns
 */
export function SkeletonCard() {
  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <Skeleton height="h-6" width="w-3/4" />
      <Skeleton height="h-4" width="w-full" />
      <Skeleton height="h-4" width="w-5/6" />
      <div className="flex gap-2 mt-4">
        <Skeleton height="h-10" width="w-24" />
        <Skeleton height="h-10" width="w-24" />
      </div>
    </div>
  );
}
