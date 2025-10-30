/**
 * Reusable Card component
 * Container with consistent padding and dark theme styling
 */

export default function Card({
  children,
  className = '',
  hoverable = false,
  padding = 'md',
  ...props
}) {
  const baseStyles = 'bg-gray-800 rounded-lg shadow-lg';
  const hoverStyles = hoverable ? 'hover:shadow-xl transition-shadow duration-200' : '';

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
