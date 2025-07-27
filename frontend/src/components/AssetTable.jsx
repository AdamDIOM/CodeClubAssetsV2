export default function AssetTable({ assets }) {
  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full bg-white border border-gray-200 shadow rounded-2xl overflow-hidden">
        <thead className="bg-gray-100 text-gray-700 text-left text-sm">
          <tr>
            <th className="px-4 py-2 border-b">ID</th>
            <th className="px-4 py-2 border-b">Name</th>
            <th className="px-4 py-2 border-b">Description</th>
            <th className="px-4 py-2 border-b">Location</th>
            <th className="px-4 py-2 border-b">Parent ID</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-800">
          {assets.map((asset) => (
            <tr key={asset.ID} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b whitespace-nowrap">{asset.ID}</td>
              <td className="px-4 py-2 border-b">{asset.Name}</td>
              <td className="px-4 py-2 border-b max-w-xs truncate" title={asset.Description}>
                {asset.Description || '—'}
              </td>
              <td className="px-4 py-2 border-b">{asset.Location || '—'}</td>
              <td className="px-4 py-2 border-b">{asset.ParentID || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}