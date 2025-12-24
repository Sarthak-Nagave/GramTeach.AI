// src/components/QuizUI.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function QuizUI({ quiz }) {
  const navigate = useNavigate();
  const questions = quiz?.questions || quiz || [];

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIndex, option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const submitQuiz = () => {
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 40 }}>
      <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 10 }}>
        Test Your Knowledge
      </h2>

      {!submitted && (
        <p style={{ fontSize: 16, color: "var(--muted)" }}>
          Select the correct answers and submit.
        </p>
      )}

      {questions.map((q, idx) => {
        const userAns = answers[idx];
        const correctAns = q.correct_answer;

        return (
          <div
            key={idx}
            style={{
              padding: 22,
              background: "var(--card)",
              borderRadius: 14,
              marginBottom: 22,
              border: "1px solid var(--border)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <h4 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              {idx + 1}. {q.question}
            </h4>

            {q.options.map((opt, i) => {
              const selected = userAns === opt;
              const isCorrect = opt === correctAns;
              const isWrong = submitted && selected && !isCorrect;

              let bg = "rgba(255,255,255,0.04)";
              let border = "1px solid rgba(255,255,255,0.1)";
              let color = "#ddd";

              if (!submitted && selected) {
                bg = "rgba(59,130,246,0.25)";
                border = "1px solid #3b82f6";
              }

              if (submitted) {
                if (selected && isCorrect) {
                  bg = "rgba(34,197,94,0.25)";
                  border = "1px solid #22c55e";
                  color = "#fff";
                } else if (isCorrect) {
                  bg = "rgba(74,222,128,0.15)";
                  border = "1px solid #4ade80";
                } else if (isWrong) {
                  bg = "rgba(239,68,68,0.25)";
                  border = "1px solid #ef4444";
                  color = "#fff";
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(idx, opt)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    marginTop: 10,
                    background: bg,
                    border,
                    borderRadius: 10,
                    textAlign: "left",
                    color,
                    fontSize: 16,
                    cursor: submitted ? "not-allowed" : "pointer",
                    transition: "0.2s",
                  }}
                >
                  {opt}
                </button>
              );
            })}

            {submitted && (
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#4ade80",
                  fontSize: 15,
                }}
              >
                <CheckCircle size={18} /> Correct Answer: {correctAns}
              </div>
            )}
          </div>
        );
      })}

      {/* Submit button */}
      {!submitted ? (
        <button
          onClick={submitQuiz}
          style={{
            padding: "14px 22px",
            width: "100%",
            fontSize: 18,
            fontWeight: 700,
            background: "#ff6b00",
            color: "#fff",
            borderRadius: 10,
            border: "none",
          }}
        >
          Submit Quiz
        </button>
      ) : (
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "14px 22px",
            width: "100%",
            marginTop: 30,
            fontSize: 18,
            fontWeight: 700,
            background: "#2563eb",
            color: "#fff",
            borderRadius: 10,
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          Go to Dashboard <ArrowRight size={20} />
        </button>
      )}
    </div>
  );
}
