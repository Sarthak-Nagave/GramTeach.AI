// src/pages/CreateLesson.jsx
import React, { useEffect, useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Mic, Sparkles } from "lucide-react";

import {
  createLesson,
  generateLesson,
  getLessonStatus,
} from "../services/api";

function askNotificationPermission() {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission().catch(() => {});
  }
}

export default function CreateLesson() {
  // ------------------------------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------------------------------
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("English");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressVisible, setProgressVisible] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatusText, setProgressStatusText] = useState("");

  // speech-to-text
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const activeFieldRef = useRef(null);

  const [activeMic, setActiveMic] = useState(null);

  // waveform
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const [levels, setLevels] = useState([6, 6, 6, 6, 6]);

  // ------------------------------------------------------------------------------------
  // INIT
  // ------------------------------------------------------------------------------------
  useEffect(() => {
    askNotificationPermission();

    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
      alert("Your browser does not support speech recognition.");
    }

    return () => {
      stopWaveform();
      SpeechRecognition.stopListening();
    };
  }, []);

  // ------------------------------------------------------------------------------------
  // APPLY SPEECH RESULT
  // ------------------------------------------------------------------------------------
  useEffect(() => {
    if (!listening && activeFieldRef.current) {
      setTimeout(() => {
        if (transcript.trim() !== "") {
          if (activeFieldRef.current === "title") setTitle(transcript.trim());
          if (activeFieldRef.current === "topic") setTopic(transcript.trim());
        }
        resetTranscript();
        activeFieldRef.current = null;
      }, 350);
    }
  }, [listening]);

  // ------------------------------------------------------------------------------------
  // MIC TOGGLE
  // ------------------------------------------------------------------------------------
  const toggleMic = (field) => {
    if (activeMic === field) {
      setActiveMic(null);
      SpeechRecognition.stopListening();
      stopWaveform();
      return;
    }

    activeFieldRef.current = field;
    setActiveMic(field);
    resetTranscript();

    const langCode =
      language === "Marathi"
        ? "mr-IN"
        : language === "Hindi"
        ? "hi-IN"
        : "en-IN";

    SpeechRecognition.startListening({
      continuous: true,
      language: langCode,
    });

    startWaveform();
  };

  // ------------------------------------------------------------------------------------
  // WAVEFORM START / STOP
  // ------------------------------------------------------------------------------------
  const startWaveform = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextObj = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextObj();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      dataRef.current = data;

      const update = () => {
        analyser.getByteFrequencyData(data);

        let avg = data.reduce((a, b) => a + b, 0) / data.length / 255;

        setLevels(
          [0, 1, 2, 3, 4].map(() =>
            Math.round(6 + avg * 28 + Math.random() * 4)
          )
        );

        rafRef.current = requestAnimationFrame(update);
      };

      update();
    } catch (e) {
      console.error("Microphone error:", e);
    }
  };

  const stopWaveform = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    if (streamRef.current)
      streamRef.current.getTracks().forEach((t) => t.stop());

    audioCtxRef.current = null;
    analyserRef.current = null;
    rafRef.current = null;
    setLevels([6, 6, 6, 6, 6]);
  };

  // ------------------------------------------------------------------------------------
  // POLLING STATUS
  // ------------------------------------------------------------------------------------
  const pollLessonStatus = async (lessonId) => {
    setProgressVisible(true);
    let stop = false;

    const loop = async () => {
      if (stop) return;

      try {
        const res = await getLessonStatus(lessonId);
        const json = res.data || {};

        setProgressPercent(json.processing_progress || 0);
        setProgressStatusText(json.processing_status || "processing");

        if (json.processing_status === "ready") {
          stop = true;
          setProgressVisible(false);
          setIsSubmitting(false);

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Lesson Ready", {
              body: "Your lesson has been generated!",
            });
          }
          return;
        }

        if (json.processing_status === "failed") {
          stop = true;
          setProgressVisible(false);
          setIsSubmitting(false);
          alert("Lesson generation failed. Check backend logs.");
          return;
        }
      } catch (e) {
        console.error("Polling error:", e);
      }

      setTimeout(loop, 2500);
    };

    loop();
  };

  // ------------------------------------------------------------------------------------
  // CREATE LESSON
  // ------------------------------------------------------------------------------------
  const handleCreate = async () => {
    if (!title.trim() || !topic.trim()) {
      alert("Both Title & Topic are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createLesson({ title, topic, language });
      const lessonId = res.data.id;

      // (❌ removed image upload completely)

      await generateLesson(lessonId);
      pollLessonStatus(lessonId);
    } catch (err) {
      alert("Error creating lesson.");
      setIsSubmitting(false);
    }
  };

  // ------------------------------------------------------------------------------------
  // COMPONENT UI
  // ------------------------------------------------------------------------------------
  const Waveform = () => (
    <div style={{ display: "flex", gap: 4, marginLeft: 6 }}>
      {levels.map((h, i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: h,
            borderRadius: 4,
            background: activeMic ? "#ff7b00" : "#444",
            transition: "height .1s linear",
          }}
        />
      ))}
    </div>
  );

  const micButton = (field) => (
    <button
      onClick={() => toggleMic(field)}
      style={{
        padding: 10,
        background:
          activeMic === field
            ? "linear-gradient(90deg,#ff8a3a,#ff6b00)"
            : "rgba(255,255,255,0.06)",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.1)",
        cursor: "pointer",
      }}
    >
      <Mic size={18} color="#fff" />
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: 40 }}>
      <div
        style={{
          maxWidth: 950,
          margin: "0 auto",
          padding: 40,
          borderRadius: 16,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 0 28px rgba(255,120,20,0.12)",
        }}
      >
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              background: "linear-gradient(180deg,#ff8a3a,#ff6b00)",
              width: 58,
              height: 58,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(255,110,20,0.3)",
            }}
          >
            <Sparkles color="#fff" size={28} />
          </div>

          <div>
            <h1 style={{ margin: 0, color: "#fff", fontWeight: 900 }}>
              Create Lesson
            </h1>
            <div style={{ color: "#ffddb8", fontSize: 13 }}>
              Talk-to-fill everything — one mic at a time
            </div>
          </div>
        </div>

        {/* LANGUAGE */}
        <div style={{ marginTop: 30 }}>
          <label style={{ color: "#ffd7b8", fontWeight: 700 }}>Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
            }}
          >
            <option>English</option>
            <option>Hindi</option>
            <option>Marathi</option>
          </select>
        </div>

        {/* TITLE */}
        <div style={{ marginTop: 26 }}>
          <label style={{ color: "#ffd7b8", fontWeight: 700 }}>Lesson Title</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Type or use voice"
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff",
              }}
            />
            {micButton("title")}
            <Waveform />
          </div>
        </div>

        {/* TOPIC */}
        <div style={{ marginTop: 26 }}>
          <label style={{ color: "#ffd7b8", fontWeight: 700 }}>
            Topic / Short Description
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Type or use voice"
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff",
              }}
            />
            {micButton("topic")}
            <Waveform />
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleCreate}
          disabled={isSubmitting}
          style={{
            marginTop: 30,
            padding: "14px 20px",
            background: "linear-gradient(90deg,#ff8a3a,#ff6b00)",
            color: "#fff",
            borderRadius: 12,
            border: "none",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 10px 30px rgba(255,120,20,0.25)",
          }}
        >
          {isSubmitting ? "Processing…" : "Create & Generate"}
        </button>

        {/* PROGRESS BAR */}
        {progressVisible && (
          <div style={{ marginTop: 24 }}>
            <div style={{ color: "#ffd7b8", marginBottom: 6 }}>
              {progressStatusText}
            </div>
            <div
              style={{
                width: "100%",
                height: 12,
                background: "#333",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  background: "linear-gradient(90deg,#ff8a3a,#ff4500)",
                  borderRadius: 10,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
