import React, { createContext, useState, useContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(() => {
    try {
      const raw = localStorage.getItem("RealChat"); // ✅ match SignIn/SignUp key
      if (!raw || raw === "undefined" || raw === "null") return null;
      const parsed = JSON.parse(raw);
      // stored object is { token, user: { _id, fullName, email, avatar } }
      if (!parsed?.token || !parsed?.user?._id) return null;
      return parsed;
    } catch {
      localStorage.removeItem("RealChat");
      return null;
    }
  });

  return (
    <AuthContext.Provider value={[authUser, setAuthUser]}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
