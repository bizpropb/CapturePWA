/**
 * Reusable Badge component
 * Small colored indicators for tags, status, etc.
 */

export default function Badge({
  children,
  variant = 'default',
  color,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  // If custom color is provided, use it
  if (color) {
    return (
      <span
        className={`${baseStyles} ${className}`}
        style={{
          backgroundColor: `${color}20`,
          color: color,
          borderWidth: '1px',
          borderColor: `${color}40`,
        }}
        {...props}
      >
        {children}
      </span>
    );
  }

  // Predefined variants
  const variants = {
    default: 'bg-gray-700 text-gray-300 border border-gray-600',
    primary: 'bg-blue-900 text-blue-200 border border-blue-700',
    success: 'bg-green-900 text-green-200 border border-green-700',
    warning: 'bg-yellow-900 text-yellow-200 border border-yellow-700',
    danger: 'bg-red-900 text-red-200 border border-red-700',
    info: 'bg-cyan-900 text-cyan-200 border border-cyan-700',
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
