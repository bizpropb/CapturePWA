/**
 * Page Header Component
 * Consistent header for all pages with optional actions
 */

export default function PageHeader({
  title,
  description,
  actions,
  children
}) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
          {description && (
            <p className="text-gray-400 mt-2">{description}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {children}
    </div>
  );
}
