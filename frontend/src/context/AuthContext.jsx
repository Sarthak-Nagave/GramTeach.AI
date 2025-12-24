// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { auth, googleProvider } from "../firebase";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // 🔒 prevents infinite backend login loop
  const backendSyncedRef = useRef(false);

  // =========================================================
  // 🔥 FIREBASE AUTH LISTENER (USER ONLY)
  // =========================================================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          backendSyncedRef.current = false;
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(firebaseUser);

        // ✅ SYNC USER WITH BACKEND ONLY ONCE
        if (!backendSyncedRef.current) {
          const token = await firebaseUser.getIdToken(true);

          await fetch("http://127.0.0.1:8000/auth/login", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          backendSyncedRef.current = true;
        }
      } catch (err) {
        console.error("Auth sync failed:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // =========================================================
  // 🔐 EMAIL LOGIN (USER)
  // =========================================================
  const login = async (email, password) => {
    backendSyncedRef.current = false;

    const res = await signInWithEmailAndPassword(auth, email, password);
    const token = await res.user.getIdToken(true);

    await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    backendSyncedRef.current = true;
    return res.user;
  };

  // =========================================================
  // 🔐 GOOGLE LOGIN (USER)
  // =========================================================
  const loginWithGoogle = async () => {
    backendSyncedRef.current = false;

    const res = await signInWithPopup(auth, googleProvider);
    const token = await res.user.getIdToken(true);

    await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    backendSyncedRef.current = true;
    return res.user;
  };

  // =========================================================
  // 🔐 OTP LOGIN (USER)
  // =========================================================
  const setupRecaptcha = (id) =>
    new RecaptchaVerifier(id, { size: "invisible" }, auth);

  const sendPhoneOTP = async (phone) => {
    const verifier = setupRecaptcha("recaptcha-container");
    const result = await signInWithPhoneNumber(auth, phone, verifier);
    setConfirmationResult(result);
    return result;
  };

  const verifyPhoneOTP = async (code) => {
    if (!confirmationResult) throw new Error("OTP not sent");

    backendSyncedRef.current = false;

    const res = await confirmationResult.confirm(code);
    const token = await res.user.getIdToken(true);

    await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    backendSyncedRef.current = true;
    return res.user;
  };

  // =========================================================
  // 🚪 USER LOGOUT (ONLY USER)
  // =========================================================
  const logout = async () => {
    backendSyncedRef.current = false;
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        sendPhoneOTP,
        verifyPhoneOTP,
        logout,
      }}
    >
      {children}
      <div id="recaptcha-container"></div>
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
