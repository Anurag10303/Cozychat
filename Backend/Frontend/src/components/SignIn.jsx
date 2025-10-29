"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useTheme } from "../context/ThemeContext";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import BASE_URL from "../config";
import ThemeToggle from "./ThemeToogle";

export default function SignIn() {
  const [authUser, setAuthUser] = useAuth();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        alert("SignIn successful!");
        localStorage.setItem("RealChat", JSON.stringify(data.user));
        setAuthUser(data);
        setFormData({ email: "", password: "" });
      })
      .catch((error) => {
        console.error("Error during signin:", error);
        alert("Something went wrong. Please try again.");
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
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div
          className={`
            mx-auto h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500
            ${
              theme === "light"
                ? "bg-gradient-to-tr from-blue-500 to-purple-500 shadow-lg shadow-blue-400/40"
                : "bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg shadow-purple-800/30"
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
            mt-8 text-center text-3xl font-bold tracking-tight transition-all duration-500
            ${
              theme === "light"
                ? "text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text"
                : "text-transparent bg-gradient-to-r from-indigo-300 via-purple-400 to-pink-300 bg-clip-text"
            }
          `}
        >
          Welcome Back 👋
        </h2>

        <p
          className={`
            text-center mt-2 text-sm transition-all
            ${theme === "light" ? "text-gray-600" : "text-gray-400"}
          `}
        >
          Sign in to continue your conversations
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div
          className={`
            p-8 rounded-2xl backdrop-blur-lg transition-all duration-500 transform hover:scale-[1.02]
            ${
              theme === "light"
                ? "bg-white/80 border border-blue-200/50 shadow-xl shadow-blue-400/10"
                : "bg-slate-800/40 border border-slate-700 shadow-[0_0_25px_rgba(79,70,229,0.15)]"
            }
          `}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium ${
                  theme === "light" ? "text-gray-800" : "text-gray-300"
                }`}
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  onChange={handleChange}
                  className={`
                    block w-full rounded-lg px-3 py-2 transition-all duration-300 focus:outline-none focus:ring-2
                    ${
                      theme === "light"
                        ? "bg-white border border-blue-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-300"
                        : "bg-slate-700 border border-slate-600 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/30"
                    }
                  `}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium ${
                  theme === "light" ? "text-gray-800" : "text-gray-300"
                }`}
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  onChange={handleChange}
                  className={`
                    block w-full rounded-lg px-3 py-2 transition-all duration-300 focus:outline-none focus:ring-2
                    ${
                      theme === "light"
                        ? "bg-white border border-blue-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-300"
                        : "bg-slate-700 border border-slate-600 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/30"
                    }
                  `}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`
                  flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-300 transform hover:scale-105
                  ${
                    theme === "light"
                      ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg hover:brightness-110"
                      : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-800/30 hover:shadow-indigo-700/50"
                  }
                `}
              >
                Sign In
              </button>
            </div>
          </form>

          <p
            className={`mt-10 text-center text-sm ${
              theme === "light" ? "text-gray-600" : "text-gray-400"
            }`}
          >
            Don't have an account?{" "}
            <Link
              to="/signUp"
              className={`font-semibold ${
                theme === "light"
                  ? "text-blue-600 hover:text-purple-600"
                  : "text-indigo-400 hover:text-indigo-300"
              }`}
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
