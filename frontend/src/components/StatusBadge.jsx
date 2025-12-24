import { CheckCircle, Clock, AlertTriangle, Loader2 } from "lucide-react";

export default function StatusBadge({ status }) {
  const normalized = status?.toLowerCase();

  const map = {
    completed: {
      icon: <CheckCircle size={14} className="text-green-600" />,
      text: "Completed",
      class: "bg-green-50 text-green-700 border-green-200"
    },
    rendering: {
      icon: <Loader2 size={14} className="animate-spin text-yellow-600" />,
      text: "Rendering",
      class: "bg-yellow-50 text-yellow-700 border-yellow-200"
    },
    queued: {
      icon: <Clock size={14} className="text-gray-600" />,
      text: "Queued",
      class: "bg-gray-50 text-gray-700 border-gray-200"
    },
    failed: {
      icon: <AlertTriangle size={14} className="text-red-600" />,
      text: "Failed",
      class: "bg-red-50 text-red-700 border-red-200"
    }
  };

  const current = map[normalized] || map["queued"];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-md ${current.class}`}>
      {current.icon}
      {current.text}
    </span>
  );
}
