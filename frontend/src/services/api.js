// src/services/api.js
import axios from "axios";
import { getAuth } from "firebase/auth";

const api = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 20000,
});

// ====================================================
// 🔐 ATTACH FIREBASE TOKEN (SAFE, SINGLE)
// ====================================================
api.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;

    // IMPORTANT: do nothing if user not ready
    if (!user) {
      return config;
    }

    try {
      // 🔥 DO NOT force refresh every time
      const token = await user.getIdToken(false);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn("[API] Failed to attach token:", err);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ====================================================
// 🚫 DO NOT AUTO-RETRY AUTH (THIS CAUSED LOOPS)
// ====================================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Just reject — no silent retries
    if (error.response?.status === 401) {
      console.warn("[API] 401 Unauthorized:", error.config?.url);
    }
    return Promise.reject(error);
  }
);

// ====================================================
// 📚 LESSON ROUTES
// ====================================================
export const createLesson = (data) =>
  api.post("/lessons/create", data);

export const listLessons = () =>
  api.get("/lessons/");

export const getMyLessons = () =>
  api.get("/lessons/");

export const getLesson = (id) =>
  api.get(`/lessons/${id}`);

export const generateLesson = (id) =>
  api.post(`/lessons/${id}/generate`);

export const getLessonStatus = (id) =>
  api.get(`/lessons/${id}/status`);

// ====================================================
// 🖼 IMAGE UPLOAD
// ====================================================
export const uploadImage = (formData) =>
  api.post("/upload/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// ====================================================
// 🧠 QUIZ ROUTES
// ====================================================
export const getQuiz = (lessonId) =>
  api.get(`/lessons/${lessonId}/quiz`);

export const submitQuizScore = (lessonId, score, total, passed) =>
  api.post(`/quizzes/${lessonId}/submit`, {
    score,
    total,
    passed,
  });

export default api;
