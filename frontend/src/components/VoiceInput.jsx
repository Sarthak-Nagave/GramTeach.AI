// src/components/VoiceInput.jsx
import React, { useState, useRef } from "react";
import { Mic, Loader2 } from "lucide-react";
import { parseVoiceInput as apiParse } from "../services/api";

export default function VoiceInput({ onAIResult }) {
  const [listening, setListening] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const start = () => {
    setError(null);
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError("Speech Recognition not supported in this browser");
      return;
    }

    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.continuous = false;

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);

    rec.onresult = async (e) => {
      const transcript = (e.results[0][0].transcript || "").trim();
      if (!transcript) {
        setError("No speech captured. Try again.");
        return;
      }

      // Send to backend parser
      setSending(true);
      try {
        // expects backend -> { topic, suggestions, language }
        const res = await apiParse(transcript);
        const data = res.data || {};
        onAIResult({
          raw: transcript,
          topic: data.topic || "",
          suggestions: data.suggestions || [],
          language: data.language || "English",
        });
      } catch (err) {
        console.error("parseVoiceInput error:", err);
        setError("Voice AI failed. Try again.");
        // fallback: basic local suggestion heuristic
        const fallbackSuggestions = fallbackGenerate(transcript);
        onAIResult({
          raw: transcript,
          topic: transcript,
          suggestions: fallbackSuggestions,
          language: "English",
        });
      } finally {
        setSending(false);
      }
    };

    rec.onerror = (e) => {
      console.error("Speech recognition error", e);
      setError("Microphone error. Check permissions.");
      setListening(false);
    };

    try {
      rec.start();
    } catch (e) {
      console.error("rec.start error", e);
      setError("Could not start microphone.");
    }
  };

  const stop = () => {
    try {
      recognitionRef.current && recognitionRef.current.stop();
    } catch (e) {}
    setListening(false);
  };

  // minimal fallback suggestions (split by commas)
  const fallbackGenerate = (text) => {
    if (!text) return [];
    const parts = text.split(/[,;:–—-]+/).map(s => s.trim()).filter(Boolean);
    // take 1-3 candidates
    return parts.slice(0, 3).map(p => p.length > 80 ? p.slice(0,80) + "…" : p);
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => (listening ? stop() : start())}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${listening ? 'bg-red-50 text-red-600' : 'bg-gray-100'}`}
        >
          {listening ? <Loader2 className="animate-spin" size={16} /> : <Mic size={16} />}
          {listening ? "Listening…" : sending ? "Processing…" : "Voice Input"}
        </button>

        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>
      <div className="text-xs text-gray-500 mt-2">Say: “Lesson Topic ... Suggested titles ... Language ...”</div>
    </div>
  );
}
