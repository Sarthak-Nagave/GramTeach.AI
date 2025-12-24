import React, { useEffect, useState } from "react";
import api from "../services/api";
import { X, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import ProgressBar from "./ProgressBar";

export default function ProgressModal({ lessonId, onClose = () => {}, onGoToDashboard = () => {} }) {
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchStatus = async () => {
      try {
        const res = await api.get(`/lessons/${lessonId}`);
        const data = res.data;
        if (!mounted) return;
        setStatus(data.status);
        setProgress(data.progress ?? 0);
        if (data.logs?.length) setLogs(data.logs);
      } catch (e) {
        console.error("poll err", e);
      }
    };

    // initial fetch
    fetchStatus();

    // poll every 3 seconds persistently until completed or failed
    const interval = setInterval(fetchStatus, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [lessonId]);

  const isDone = status === "completed" || status === "success";
  const isFailed = status === "failed" || status === "error";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Rendering Progress</h3>
            <p className="text-sm text-slate-500 mt-1">Lesson ID: {lessonId}</p>
          </div>

          <div className="flex items-center gap-3">
            {isDone && <CheckCircle className="text-green-600" />}
            {isFailed && <AlertTriangle className="text-red-600" />}
            <button onClick={onClose} className="p-2 rounded hover:bg-slate-100"><X /></button>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600 font-medium">{status ?? "starting"}</div>
            {!isDone && !isFailed && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="animate-spin" /> live
              </div>
            )}
          </div>

          <div className="mt-4">
            <ProgressBar value={progress} />
          </div>

          <div className="mt-3 text-sm text-slate-600">
            {isDone ? "Rendering complete. You can watch the lesson now." : isFailed ? "Rendering failed. Check logs or retry." : `Rendering in progress — ${progress ?? 0}%`}
          </div>

          {/* Logs */}
          <div className="mt-4 bg-slate-50 border rounded p-3 max-h-48 overflow-auto text-xs">
            {logs.length === 0 ? <div className="text-slate-400">No logs yet</div> : logs.map((l, i) => <div key={i} className="py-1">{l}</div>)}
          </div>

          {/* Actions */}
          <div className="mt-4 flex justify-end gap-3">
            <button className="px-4 py-2 rounded border" onClick={onClose}>Close</button>
            <button className="px-4 py-2 rounded bg-brand-600 text-white" onClick={onGoToDashboard}>Go to Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );
}
