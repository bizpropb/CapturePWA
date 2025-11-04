'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * Page Header Component
 * Consistent header for all pages with online indicator and optional actions
 */
export default function PageHeader({
  title,
  description,
  actions,
  children,
  showOnlineIndicator = true
}) {
  const isOnline = useOnlineStatus();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
          {description && (
            <p className="text-gray-400 mt-2">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}

          {showOnlineIndicator && (
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-400">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
