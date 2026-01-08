"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import BASE_URL from "../config";
import ThemeToggle from "./ThemeToogle";

export default function SignIn() {
  const [authUser, setAuthUser] = useAuth();
  const { theme } = useTheme();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [toast, setToast] = useState({ message: "", type: "" });

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

    const userInfo = {
      email: formData.email,
      password: formData.password,
    };

    fetch(`${BASE_URL}/user/signIn`, {
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

        showToast("Signed in successfully", "success");
      })
      .catch((error) => {
        console.error("Error during signin:", error);
        showToast("Invalid email or password", "error");
      });
  };

  return (
    <div
      className={`
        flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 transition-all duration-700
        ${
          theme === "light"
            ? "bg-gradient-to-br from-blue-100 via-white to-pink-100"
            : "bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]"
        }
      `}
      style={{ height: "100vh" }}
    >
      {/* Toast UI */}
      {toast.message && (
        <div
          className={`
            fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg
            animate-slide-in
            ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }
          `}
        >
          {toast.message}
        </div>
      )}

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div
          className={`
            mx-auto h-14 w-14 rounded-2xl flex items-center justify-center
            ${
              theme === "light"
                ? "bg-gradient-to-tr from-blue-500 to-purple-500"
                : "bg-gradient-to-br from-indigo-600 to-purple-700"
            }
          `}
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
            />
          </svg>
        </div>

        <h2
          className={`
            mt-8 text-center text-3xl font-bold tracking-tight
            ${
              theme === "light"
                ? "text-transparent bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text"
                : "text-transparent bg-gradient-to-r from-indigo-300 to-pink-300 bg-clip-text"
            }
          `}
        >
          Welcome Back 👋
        </h2>

        <p
          className={`text-center mt-2 text-sm ${
            theme === "light" ? "text-gray-600" : "text-gray-400"
          }`}
        >
          Sign in to continue your conversations
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div
          className={`
            p-8 rounded-2xl backdrop-blur-lg
            ${
              theme === "light"
                ? "bg-white/80 shadow-xl"
                : "bg-slate-800/40 border border-slate-700"
            }
          `}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              name="email"
              type="email"
              required
              onChange={handleChange}
              placeholder="Email address"
              className="w-full rounded-lg px-3 py-2"
            />

            <input
              name="password"
              type="password"
              required
              onChange={handleChange}
              placeholder="Password"
              className="w-full rounded-lg px-3 py-2"
            />

            <button
              type="submit"
              className="w-full rounded-lg py-2 text-white bg-gradient-to-r from-blue-500 to-pink-500"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            Don’t have an account?{" "}
            <Link to="/signUp" className="font-semibold text-blue-600">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
