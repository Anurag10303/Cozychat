"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import BASE_URL from "../config";
import ThemeToggle from "./ThemeToogle";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

export default function SignIn() {
  const [authUser, setAuthUser] = useAuth();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [toast, setToast] = useState({ message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isLight = theme === "light";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 2500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const userInfo = { email: formData.email, password: formData.password };

    fetch(`${BASE_URL}/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(userInfo),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (!data.token) throw new Error("Authentication token missing");
        localStorage.setItem("RealChat", JSON.stringify(data.user));
        setAuthUser(data);
        setFormData({ email: "", password: "" });
        showToast("logged in successfully", "success");
      })
      .catch((error) => {
        console.error("Error during login:", error);
        showToast("Invalid email or password", "error");
      })
      .finally(() => setIsLoading(false));
  };

  const avatars = ["AS", "PK", "RV"];

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-all duration-500 ${
        isLight
          ? "bg-gradient-to-br from-purple-50 via-white to-pink-50"
          : "bg-gradient-to-br from-[#0E0A18] via-[#1A1030] to-[#0E0A18]"
      }`}
      // style={{ height: "100vh" }}
    >
      {/* Background blobs */}
      <div
        className={`absolute top-[-120px] left-[-120px] w-[450px] h-[450px] rounded-full blur-[140px] opacity-25 ${
          isLight ? "bg-purple-300" : "bg-purple-950"
        }`}
        style={{ animation: "blob-float 8s ease-in-out infinite" }}
      />
      <div
        className={`absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] rounded-full blur-[140px] opacity-20 ${
          isLight ? "bg-pink-300" : "bg-pink-950"
        }`}
        style={{ animation: "blob-float 10s ease-in-out infinite reverse" }}
      />

      {/* Theme toggle */}
      <div className="absolute top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      {/* Toast */}
      {toast.message && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl ${
            toast.type === "success" ? "text-white" : "bg-red-500 text-white"
          }`}
          style={
            toast.type === "success"
              ? { background: "linear-gradient(135deg, #7F77DD, #D4537E)" }
              : {}
          }
        >
          {toast.message}
        </div>
      )}

      {/* Main card */}
      <div
        className={`w-full max-w-3xl rounded-3xl overflow-hidden flex shadow-2xl relative z-10 ${
          isLight
            ? "border border-purple-100/60"
            : "border border-purple-900/20"
        }`}
        style={{ animation: "fadeSlideUp 0.4s ease-out" }}
      >
        {/* LEFT PANEL */}
        <div
          className="relative w-[42%] flex-shrink-0 flex flex-col justify-center items-center p-10 overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, #7B6EDB 0%, #9B4FAF 40%, #D4537E 100%)",
          }}
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/10" />

          {/* Logo */}
          <div
            className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            <MessageCircle className="w-7 h-7 text-white" />
          </div>

          <h2
            className="relative z-10 text-2xl font-bold text-white text-center leading-tight mb-3"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Welcome back
          </h2>
          <p
            className="relative z-10 text-sm text-center leading-relaxed mb-8 max-w-[180px]"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            Your conversations are waiting for you.
          </p>

          {/* Stacked avatars */}
          <div className="relative z-10 flex mb-3">
            {avatars.map((av, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{
                  marginLeft: i > 0 ? "-10px" : "0",
                  zIndex: avatars.length - i,
                  background: "rgba(255,255,255,0.2)",
                  border: "2px solid rgba(255,255,255,0.5)",
                }}
              >
                {av}
              </div>
            ))}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{
                marginLeft: "-10px",
                background: "rgba(255,255,255,0.2)",
                border: "2px solid rgba(255,255,255,0.5)",
              }}
            >
              +8
            </div>
          </div>
          <p
            className="relative z-10 text-xs mb-8"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            3 friends online now
          </p>

          {/* Feature tags */}
          <div className="relative z-10 flex flex-wrap gap-2 justify-center">
            {["Real-time", "Secure", "Fast"].map((tag) => (
              <span
                key={tag}
                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          className="flex-1 flex flex-col justify-center p-10 overflow-y-auto"
          style={{
            background: isLight
              ? "rgba(255,252,255,0.95)"
              : "rgba(18,10,32,0.97)",
            backdropFilter: "blur(24px)",
          }}
        >
          <p
            className="text-xs font-bold tracking-widest uppercase mb-2"
            style={{ color: isLight ? "#7F77DD" : "#AFA9EC" }}
          >
            Login
          </p>
          <h1
            className="text-2xl font-extrabold mb-1"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: isLight ? "#1A1228" : "#F0EAF8",
              letterSpacing: "-0.5px",
            }}
          >
            Good to see you
          </h1>
          <p
            className="text-sm mb-7"
            style={{ color: isLight ? "#9E88B8" : "#7A6A90" }}
          >
            Enter your credentials to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: isLight ? "#7C6A9A" : "#8A7AAA" }}
              >
                <Mail
                  className="w-3 h-3"
                  style={{ color: isLight ? "#7F77DD" : "#AFA9EC" }}
                />
                Email address
              </label>
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3 border transition-all duration-200"
                style={{
                  background: isLight
                    ? "rgba(248,242,255,0.95)"
                    : "rgba(30,18,50,0.95)",
                  borderColor: isLight
                    ? "rgba(127,119,221,0.2)"
                    : "rgba(140,100,200,0.2)",
                }}
              >
                <Mail
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: isLight ? "#9E88B8" : "#7A6A90" }}
                />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: isLight ? "#1A1228" : "#F0EAF8" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: isLight ? "#7C6A9A" : "#8A7AAA" }}
              >
                <Lock
                  className="w-3 h-3"
                  style={{ color: isLight ? "#7F77DD" : "#AFA9EC" }}
                />
                Password
              </label>
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3 border transition-all duration-200"
                style={{
                  background: isLight
                    ? "rgba(248,242,255,0.95)"
                    : "rgba(30,18,50,0.95)",
                  borderColor: isLight
                    ? "rgba(127,119,221,0.2)"
                    : "rgba(140,100,200,0.2)",
                }}
              >
                <Lock
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: isLight ? "#9E88B8" : "#7A6A90" }}
                />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: isLight ? "#1A1228" : "#F0EAF8" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                >
                  {showPassword ? (
                    <EyeOff
                      className="w-4 h-4"
                      style={{ color: isLight ? "#7C6A9A" : "#8A7AAA" }}
                    />
                  ) : (
                    <Eye
                      className="w-4 h-4"
                      style={{ color: isLight ? "#7C6A9A" : "#8A7AAA" }}
                    />
                  )}
                </button>
              </div>
              <div className="text-right mt-2">
                <span
                  className="text-xs font-semibold cursor-pointer hover:underline"
                  style={{ color: isLight ? "#7F77DD" : "#AFA9EC" }}
                >
                  Forgot password?
                </span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl py-3.5 text-sm font-bold text-white flex items-center justify-center gap-2 mt-2 transition-all duration-200 disabled:opacity-60"
              style={{
                background:
                  "linear-gradient(135deg, #7F77DD 0%, #A855C8 50%, #D4537E 100%)",
                boxShadow: "0 6px 24px rgba(127,119,221,0.4)",
              }}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Login <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p
            className="text-xs text-center mt-6"
            style={{ color: isLight ? "#9E88B8" : "#7A6A90" }}
          >
            No account?{" "}
            <Link
              to="/signUp"
              className="font-bold hover:underline"
              style={{ color: isLight ? "#7F77DD" : "#AFA9EC" }}
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
