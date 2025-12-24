export default function ProgressBar({ value = 0 }) {
  const safe = Math.max(0, Math.min(100, Number(value || 0)));
  return (
    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-brand-600 to-violet-500 transition-all" style={{ width: `${safe}%` }} />
    </div>
  );
}
