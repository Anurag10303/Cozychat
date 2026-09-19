import React, { createContext, useState, useContext, useEffect } from "react";
import { STORAGE_KEY, expireSession, getTokenExpiry, isExpired } from "../lib/session";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY); // ✅ match SignIn/SignUp key
      if (!raw || raw === "undefined" || raw === "null") return null;
      const parsed = JSON.parse(raw);
      // stored object is { token, user: { _id, fullName, email, avatar } }
      if (!parsed?.token || !parsed?.user?._id) return null;
      if (isExpired(parsed.token)) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });

  // Sign out exactly when the token expires, instead of leaving a broken session.
  useEffect(() => {
    const exp = authUser?.token && getTokenExpiry(authUser.token);
    if (!exp) return;
    const ms = exp - Date.now();
    if (ms <= 0) return expireSession();
    // setTimeout can't exceed ~24.8 days; tokens last 7, but clamp to be safe.
    const timer = setTimeout(expireSession, Math.min(ms, 2 ** 31 - 1));
    return () => clearTimeout(timer);
  }, [authUser?.token]);

  return (
    <AuthContext.Provider value={[authUser, setAuthUser]}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
