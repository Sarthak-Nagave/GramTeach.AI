// src/pages/WatchLesson.jsx
import React, { useEffect, useState } from "react";
import { getLesson, getQuiz } from "../services/api";
import { useParams } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import QuizUI from "../components/QuizUI";

export default function WatchLesson() {
  const { id } = useParams();

  const [lesson, setLesson] = useState(null);
  const [videoURL, setVideoURL] = useState(null);

  const [quiz, setQuiz] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const [countdown, setCountdown] = useState(null);

  // -------------------------------
  // LOAD LESSON
  // -------------------------------
  useEffect(() => {
    async function load() {
      const res = await getLesson(id);
      const data = res.data;

      const url =
        data.video_url ||
        data.final_video ||
        data.s3_url ||
        data.video ||
        null;

      setLesson(data);
      setVideoURL(url);
    }
    load();
  }, [id]);

  // Normalize backend quiz into correct UI format
  function normalizeQuiz(resQuiz) {
    if (!resQuiz) return null;

    // Case 1: backend returns { questions: [...] }
    if (resQuiz.questions) return resQuiz;

    // Case 2: backend returns array [...]
    if (Array.isArray(resQuiz)) {
      return {
        questions: resQuiz.map((q) => ({
          question: q.question,
          options: q.options,
          correct_answer: q.answer || q.correct_answer,
        })),
      };
    }

    return null;
  }

  // -------------------------------
  // END → COUNTDOWN → QUIZ
  // -------------------------------
  const handleVideoEnd = async () => {
    if (loadingQuiz || showQuiz) return;

    setLoadingQuiz(true);
    setCountdown(3);

    let timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const res = await getQuiz(id);

      console.log("RAW QUIZ RESPONSE:", res);

      const quizData = normalizeQuiz(res.data || res);

      if (!quizData || !quizData.questions || quizData.questions.length === 0) {
        alert("Quiz not ready yet.");
        setLoadingQuiz(false);
        return;
      }

      setTimeout(() => {
        setQuiz(quizData.questions);
        setShowQuiz(true);
      }, 3000);

    } catch (err) {
      console.error("Quiz load failed:", err);
      alert("Quiz not ready.");
    }

    setLoadingQuiz(false);
  };

  if (!lesson) {
    return (
      <div className="container p-6 text-center text-gray-400 text-xl">
        Loading lesson…
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>
      <h1 style={{ fontSize: 38, fontWeight: 800 }}>{lesson.title}</h1>
      <p style={{ fontSize: 18, color: "var(--muted)" }}>{lesson.topic}</p>

      {/* VIDEO */}
      {!showQuiz && (
        <div
          style={{
            marginTop: 26,
            display: "flex",
            justifyContent: "center",
            opacity: countdown ? 0.3 : 1,
            transition: "opacity 1.2s ease",
          }}
        >
          {videoURL ? (
            <VideoPlayer
              src={videoURL}
              scenes={lesson.processed_scenes || []}
              onEnded={handleVideoEnd}
            />
          ) : (
            <div
              style={{
                width: "100%",
                maxWidth: 1100,
                height: 400,
                background: "#000",
                borderRadius: 12,
              }}
            />
          )}
        </div>
      )}

      {/* COUNTDOWN */}
      {countdown !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.75)",
            color: "white",
            fontSize: "64px",
            fontWeight: "900",
            zIndex: 999,
          }}
        >
          Quiz begins in {countdown}…
        </div>
      )}

      {/* QUIZ */}
      {showQuiz && quiz && (
        <div style={{ marginTop: 40 }}>
          <QuizUI quiz={quiz} lessonId={lesson.id} />
        </div>
      )}
    </div>
  );
}
