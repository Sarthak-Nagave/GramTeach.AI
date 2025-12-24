export default function StatCard({ title, value, foot }) {
  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
      {foot && <div className="text-xs text-gray-400 mt-2">{foot}</div>}
    </div>
  );
}
