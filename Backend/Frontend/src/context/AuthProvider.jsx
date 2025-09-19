import React, { createContext, useState, useContext } from "react";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  let parsedUser = null;

  try {
    const rawCookie = Cookies.get("jwt");
    const rawStorage = localStorage.getItem("ChatAPP");
    const raw = rawCookie || rawStorage;

      if (raw && raw !== "undefined" && raw !== "null") {
      parsedUser = JSON.parse(raw);

      if (!parsedUser?.email || !parsedUser?.token) {
        parsedUser = null;
      }
    }
  } catch (err) {
    console.error("JWT parse error:", err);
 Cookies.remove("jwt");
    localStorage.removeItem("ChatAPP");

    parsedUser = null;
  }

  const [authUser, setAuthUser] = useState(parsedUser);

  return (
    <AuthContext.Provider value={[authUser, setAuthUser]}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
