/**
 * Reusable Input component
 * Styled for dark mode with consistent focus states
 */

export default function Input({
  label,
  error,
  className = '',
  ...props
}) {
  const baseStyles = 'w-full px-3 py-2 bg-gray-700 border text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';
  const borderStyles = error ? 'border-red-600' : 'border-gray-600';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <input
        className={`${baseStyles} ${borderStyles} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
