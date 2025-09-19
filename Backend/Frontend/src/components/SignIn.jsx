"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthProvider"
import { useTheme } from "../context/ThemeContext"
import Cookies from "js-cookie"
import { Link } from "react-router-dom"
import BASE_URL from "../config"
import ThemeToggle from "./ThemeToogle"

export default function SignIn() {
  const [authUser, setAuthUser] = useAuth()
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // SignIn.jsx
// SignIn.jsx
// SignIn.jsx
// SignIn.jsx
// SignIn.jsx
const handleSubmit = (e) => {
  e.preventDefault();
  const userInfo = {
    email: formData.email,
    password: formData.password,
  };

  fetch(`${BASE_URL}/user/signIn`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Rely on server-set cookie
    body: JSON.stringify(userInfo),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .then((data) => {
      console.log("Server Response:", data);
      if (!data.token) {
        throw new Error("Authentication token missing from server response");
      }
      alert("SignIn successful!");
      // No Cookies.set needed; rely on server-set cookie
      console.log("Server should have set cookie; check network tab");
      localStorage.setItem("RealChat", JSON.stringify(data.user));
      setAuthUser(data);
      setFormData({
        email: "",
        password: "",
      });
    })
    .catch((error) => {
      console.error("Error during signin:", error);
      alert("Something went wrong. Please try again.");
    });
};
  return (
    <div
      className={`
      flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 transition-all duration-500 
      ${
        theme === "light"
          ? "bg-gradient-to-br from-blue-50 via-white to-purple-50 "
          : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      }
    ` }
    style={{ height: "100vh" }}
    >
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div
          className={`
          mx-auto h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 animate-pulse
          ${theme === "light" ? "bg-gradient-to-br from-blue-500 to-purple-500" : "bg-gradient-to-br from-blue-600 to-blue-700"}
        `}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          mt-10 text-center text-2xl/9 font-bold tracking-tight transition-all duration-300
          ${
            theme === "light"
              ? "text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text"
              : "text-white"
          }
        `}
        >
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div
          className={`
          p-8 rounded-2xl transition-all duration-300 transform hover:scale-[1.02]
          ${
            theme === "light"
              ? "bg-white/80 backdrop-blur-sm shadow-2xl shadow-blue-500/10 border border-blue-200/50"
              : "bg-slate-800/50 backdrop-blur-sm shadow-2xl border border-slate-700"
          }
        `}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className={`
                block text-sm/6 font-medium transition-colors duration-300
                ${theme === "light" ? "text-gray-800" : "text-gray-200"}
              `}
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  onChange={handleChange}
                  className={`
                    block w-full rounded-lg px-3 py-2 transition-all duration-300 focus:outline-none focus:ring-2 transform hover:scale-[1.01]
                    ${
                      theme === "light"
                        ? "bg-white border border-blue-200 text-gray-900 placeholder:text-blue-400 focus:border-blue-400 focus:ring-blue-400/20 shadow-lg"
                        : "bg-slate-700 border border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                    }
                  `}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className={`
                block text-sm/6 font-medium transition-colors duration-300
                ${theme === "light" ? "text-gray-800" : "text-gray-200"}
              `}
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
                  autoComplete="current-password"
                  className={`
                    block w-full rounded-lg px-3 py-2 transition-all duration-300 focus:outline-none focus:ring-2 transform hover:scale-[1.01]
                    ${
                      theme === "light"
                        ? "bg-white border border-blue-200 text-gray-900 placeholder:text-blue-400 focus:border-blue-400 focus:ring-blue-400/20 shadow-lg"
                        : "bg-slate-700 border border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                    }
                  `}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`
                  flex w-full justify-center rounded-lg px-3 py-2 text-sm/6 font-semibold transition-all duration-300 transform hover:scale-105
                  ${
                    theme === "light"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg"
                  }
                `}
              >
                Sign in
              </button>
            </div>
          </form>

          <p
            className={`
            mt-10 text-center text-sm/6 transition-colors duration-300
            ${theme === "light" ? "text-gray-600" : "text-gray-400"}
          `}
          >
            Don't Have an account?{" "}
            <Link
              to="/signUp"
              className={`
              font-semibold transition-colors duration-300
              ${theme === "light" ? "text-blue-600 hover:text-purple-600" : "text-blue-400 hover:text-blue-300"}
            `}
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
