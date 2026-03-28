"use client";

import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import BASE_URL from "../config";
import ThemeToggle from "./ThemeToogle";
import AvatarUpload from "./AvatarUpload";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  MessageCircle,
  User,
  Check,
} from "lucide-react";

export default function SignUp() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: null,
  });

  const isLight = theme === "light";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (file) => {
    setFormData((prev) => ({ ...prev, avatar: file }));
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 2500);
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strengthColors = ["", "#E24B4A", "#EF9F27", "#7F77DD", "#2EAD6E"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showToast("Passwords do not match!", "error");
      return;
    }
    setIsLoading(true);
    const formPayload = new FormData();
    formPayload.append("fullName", formData.fullName);
    formPayload.append("email", formData.email);
    formPayload.append("password", formData.password);
    formPayload.append("confirmPassword", formData.confirmPassword);
    if (formData.avatar) formPayload.append("avatar", formData.avatar);

    try {
      const response = await fetch(`${BASE_URL}/user/signUp`, {
        method: "POST",
        body: formPayload,
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");

      showToast("Account created! Please login.", "success");

      // ✅ Reset form
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        avatar: null,
      });

      // ✅ Wait for toast to show, then navigate
      setTimeout(() => {
        navigate("/login"); // ✅ absolute path — was "login" before (broken)
      }, 1000);

      // ✅ Removed: localStorage.setItem + setAuthUser
      // Setting authUser after signup caused the app to treat the user as
      // logged in, which fought with navigate("/login") and broke redirection
    } catch (error) {
      console.error("Error during SignUp:", error.message);
      showToast(error.message || "SignUp failed. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength();

  const inputStyle = {
    background: isLight ? "rgba(248,242,255,0.95)" : "rgba(30,18,50,0.95)",
    borderColor: isLight ? "rgba(127,119,221,0.2)" : "rgba(140,100,200,0.2)",
    color: isLight ? "#1A1228" : "#F0EAF8",
  };

  const labelStyle = { color: isLight ? "#7C6A9A" : "#8A7AAA" };
  const iconColor = isLight ? "#7F77DD" : "#AFA9EC";
  const subColor = isLight ? "#9E88B8" : "#7A6A90";

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center relative overflow-hidden transition-all duration-500 ${
        isLight
          ? "bg-gradient-to-br from-purple-50 via-white to-pink-50"
          : "bg-gradient-to-br from-[#0E0A18] via-[#1A1030] to-[#0E0A18]"
      }`}
    >
      {/* Background blobs */}
      <div
        className={`absolute top-[-120px] left-[-120px] w-[450px] h-[450px] rounded-full blur-[140px] opacity-25 pointer-events-none ${isLight ? "bg-purple-300" : "bg-purple-950"}`}
        style={{ animation: "blob-float 8s ease-in-out infinite" }}
      />
      <div
        className={`absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] rounded-full blur-[140px] opacity-20 pointer-events-none ${isLight ? "bg-pink-300" : "bg-pink-950"}`}
        style={{ animation: "blob-float 10s ease-in-out infinite reverse" }}
      />

      <div className="absolute top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      {toast.message && (
        <div
          className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl"
          style={
            toast.type === "success"
              ? {
                  background: "linear-gradient(135deg, #7F77DD, #D4537E)",
                  color: "#fff",
                }
              : { background: "#E24B4A", color: "#fff" }
          }
        >
          {toast.message}
        </div>
      )}

      {/* Scrollable page wrapper */}
      <div className="w-full min-h-screen flex items-start justify-center py-10 px-4 overflow-y-auto">
        {/* Main card */}
        <div
          className={`w-full max-w-4xl rounded-3xl overflow-hidden flex shadow-2xl relative z-10 ${
            isLight
              ? "border border-purple-100/60"
              : "border border-purple-900/20"
          }`}
          style={{ animation: "fadeSlideUp 0.4s ease-out" }}
        >
          {/* LEFT PANEL */}
          <div
            className="relative w-[38%] flex-shrink-0 flex flex-col justify-center items-center p-10 overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, #7B6EDB 0%, #9B4FAF 40%, #D4537E 100%)",
              minHeight: "100%",
            }}
          >
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/10" />

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
              Join CozyChat Today
            </h2>
            <p
              className="relative z-10 text-sm text-center leading-relaxed mb-8 max-w-[200px]"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              Connect with people who matter. Real conversations, real moments.
            </p>

            {/* Stacked avatars */}
            <div className="relative z-10 flex mb-2">
              {["AS", "PK", "RV", "SM"].map((av, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    marginLeft: i > 0 ? "-10px" : "0",
                    zIndex: 4 - i,
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
              12 people joined this week
            </p>

            {/* Feature list */}
            <div className="relative z-10 space-y-3 w-full max-w-[200px]">
              {[
                "Real-time messaging",
                "Online status",
                "Secure & private",
                "Lightning fast",
              ].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.2)" }}
                  >
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div
            className="flex-1 flex flex-col justify-center p-10"
            style={{
              background: isLight
                ? "rgba(255,252,255,0.95)"
                : "rgba(18,10,32,0.97)",
              backdropFilter: "blur(24px)",
            }}
          >
            <p
              className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: iconColor }}
            >
              Get started free
            </p>
            <h1
              className="text-2xl font-extrabold mb-1"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: isLight ? "#1A1228" : "#F0EAF8",
                letterSpacing: "-0.5px",
              }}
            >
              Create your account
            </h1>
            <p className="text-sm mb-6" style={{ color: subColor }}>
              Fill in your details to start chatting instantly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar upload */}
              <div
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{
                  background: isLight
                    ? "rgba(127,119,221,0.06)"
                    : "rgba(175,169,236,0.05)",
                  border: isLight
                    ? "1px dashed rgba(127,119,221,0.25)"
                    : "1px dashed rgba(175,169,236,0.18)",
                }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isLight
                      ? "rgba(127,119,221,0.1)"
                      : "rgba(175,169,236,0.08)",
                  }}
                >
                  <User className="w-6 h-6" style={{ color: iconColor }} />
                </div>
                <div className="flex-1">
                  <p
                    className="text-sm font-semibold mb-0.5"
                    style={{ color: isLight ? "#1A1228" : "#F0EAF8" }}
                  >
                    Profile photo
                  </p>
                  <p className="text-xs" style={{ color: subColor }}>
                    JPG, PNG up to 5MB
                  </p>
                </div>
                <AvatarUpload
                  onAvatarChange={handleAvatarChange}
                  currentAvatarFile={formData.avatar}
                />
              </div>

              {/* Full name */}
              <div>
                <label
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2"
                  style={labelStyle}
                >
                  <User className="w-3 h-3" style={{ color: iconColor }} />
                  Full name
                </label>
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3 border transition-all duration-200"
                  style={inputStyle}
                >
                  <User
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: subColor }}
                  />
                  <input
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: isLight ? "#1A1228" : "#F0EAF8" }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2"
                  style={labelStyle}
                >
                  <Mail className="w-3 h-3" style={{ color: iconColor }} />
                  Email address
                </label>
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3 border transition-all duration-200"
                  style={inputStyle}
                >
                  <Mail
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: subColor }}
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
                  style={labelStyle}
                >
                  <Lock className="w-3 h-3" style={{ color: iconColor }} />
                  Password
                </label>
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3 border transition-all duration-200"
                  style={inputStyle}
                >
                  <Lock
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: subColor }}
                  />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: isLight ? "#1A1228" : "#F0EAF8" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="opacity-50 hover:opacity-100 transition-opacity"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" style={{ color: subColor }} />
                    ) : (
                      <Eye className="w-4 h-4" style={{ color: subColor }} />
                    )}
                  </button>
                </div>
                {/* Strength bar */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1.5 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{
                            background:
                              i <= strength
                                ? strengthColors[strength]
                                : isLight
                                  ? "rgba(127,119,221,0.1)"
                                  : "rgba(175,169,236,0.08)",
                          }}
                        />
                      ))}
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: strengthColors[strength] }}
                    >
                      {strengthLabels[strength]}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2"
                  style={labelStyle}
                >
                  <Lock className="w-3 h-3" style={{ color: iconColor }} />
                  Confirm password
                </label>
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3 border transition-all duration-200"
                  style={inputStyle}
                >
                  <Lock
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: subColor }}
                  />
                  <input
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: isLight ? "#1A1228" : "#F0EAF8" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="opacity-50 hover:opacity-100 transition-opacity"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" style={{ color: subColor }} />
                    ) : (
                      <Eye className="w-4 h-4" style={{ color: subColor }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setAgreed(!agreed)}
                  className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200"
                  style={{
                    background: agreed
                      ? "linear-gradient(135deg, #7F77DD, #D4537E)"
                      : "transparent",
                    border: agreed
                      ? "none"
                      : isLight
                        ? "1.5px solid rgba(127,119,221,0.3)"
                        : "1.5px solid rgba(175,169,236,0.2)",
                  }}
                >
                  {agreed && (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  )}
                </button>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: subColor }}
                >
                  I agree to the{" "}
                  <span
                    className="font-semibold cursor-pointer hover:underline"
                    style={{ color: iconColor }}
                  >
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span
                    className="font-semibold cursor-pointer hover:underline"
                    style={{ color: iconColor }}
                  >
                    Privacy Policy
                  </span>
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl py-3.5 text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
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
                    Create account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-center mt-5" style={{ color: subColor }}>
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold hover:underline"
                style={{ color: iconColor }}
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
