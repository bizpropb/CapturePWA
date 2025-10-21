'use client';

export default function MomentCard({ moment, onDelete, onEdit }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hasLocation = moment.gpsLat !== 0 || moment.gpsLng !== 0;

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <div className="mb-3">
        <p className="text-gray-800 text-lg whitespace-pre-wrap">{moment.description}</p>
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <p>
          <span className="font-medium">Created:</span> {formatDate(moment.createdAt)}
        </p>

        {hasLocation ? (
          <p>
            <span className="font-medium">Location:</span> {moment.gpsLat.toFixed(4)}, {moment.gpsLng.toFixed(4)}
          </p>
        ) : (
          <p className="text-gray-400">No location</p>
        )}

        {moment.imageUrl && (
          <p className="text-blue-600">📷 Has image</p>
        )}

        {moment.audioUrl && (
          <p className="text-blue-600">🎵 Has audio</p>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onEdit(moment)}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(moment.id)}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
