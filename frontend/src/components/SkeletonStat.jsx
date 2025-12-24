export default function SkeletonStat() {
  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-6 bg-gray-200 rounded w-16 mt-3"></div>
      <div className="h-3 bg-gray-200 rounded w-20 mt-3"></div>
    </div>
  );
}
