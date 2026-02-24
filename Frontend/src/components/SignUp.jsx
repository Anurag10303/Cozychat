"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useTheme } from "../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import BASE_URL from "../config";
import ThemeToggle from "./ThemeToogle";
import Cookies from "js-cookie";
import AvatarUpload from "./AvatarUpload";

export default function SignUp() {
  const [authUser, setAuthUser] = useAuth();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: null,
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (file) => {
    setFormData((prev) => ({ ...prev, avatar: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

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

      alert("Registration successful!");
      if (data.token) {
        Cookies.set("jwt", data.token, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
        });
      }
      localStorage.setItem("ChatAPP", JSON.stringify(data));
      setAuthUser(data);
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        avatar: null,
      });
      navigate("/signIn");
    } catch (error) {
      console.error("Error during signup:", error.message);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-center px-6 py-12 lg:px-8 transition-all duration-700 ${
        theme === "light"
          ? "bg-gradient-to-br from-blue-100 via-white to-pink-100"
          : "bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]"
      }`}
    >
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div
          className={`mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ${
            theme === "light"
              ? "bg-gradient-to-tr from-blue-500 to-purple-500 shadow-lg shadow-blue-400/30"
              : "bg-gradient-to-tr from-indigo-600 to-purple-700 shadow-lg shadow-purple-800/30"
          }`}
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
              d="M12 11c0 1.657-1.343 3-3 3S6 12.657 6 11s1.343-3 3-3 3 1.343 3 3zM19 20v-1a4 4 0 00-4-4H9a4 4 0 00-4 4v1"
            />
          </svg>
        </div>

        <h2
          className={`text-3xl font-bold tracking-tight mb-2 ${
            theme === "light"
              ? "text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text"
              : "text-transparent bg-gradient-to-r from-indigo-300 via-purple-400 to-pink-300 bg-clip-text"
          }`}
        >
          Create Your Account
        </h2>
        <p
          className={`text-sm ${
            theme === "light" ? "text-gray-600" : "text-gray-400"
          }`}
        >
          Join CozyChat and start connecting instantly 💬
        </p>
      </div>

      {/* Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form
          onSubmit={handleSubmit}
          className={`p-8 rounded-2xl backdrop-blur-lg transition-all duration-500 transform hover:scale-[1.01] ${
            theme === "light"
              ? "bg-white/80 border border-blue-200/50 shadow-xl shadow-blue-400/10"
              : "bg-slate-800/40 border border-slate-700 shadow-[0_0_25px_rgba(79,70,229,0.15)]"
          }`}
        >
          {/* Avatar */}
          <div className="mb-4">
            <label
              className={`block text-sm font-medium mb-1 ${
                theme === "light" ? "text-gray-800" : "text-gray-200"
              }`}
            >
              Upload Avatar
            </label>
            <AvatarUpload
              onAvatarChange={handleAvatarChange}
              currentAvatarFile={formData.avatar}
            />
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label
              htmlFor="fullName"
              className={`block text-sm font-medium ${
                theme === "light" ? "text-gray-800" : "text-gray-200"
              }`}
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className={`block w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition-all duration-300 ${
                theme === "light"
                  ? "bg-white border border-blue-200 text-gray-900 focus:border-blue-400 focus:ring-blue-300"
                  : "bg-slate-700 border border-slate-600 text-white focus:border-indigo-500 focus:ring-indigo-500/30"
              }`}
            />
          </div>

          {/* Email */}
          <div className="space-y-1 mt-4">
            <label
              htmlFor="email"
              className={`block text-sm font-medium ${
                theme === "light" ? "text-gray-800" : "text-gray-200"
              }`}
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`block w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition-all duration-300 ${
                theme === "light"
                  ? "bg-white border border-blue-200 text-gray-900 focus:border-blue-400 focus:ring-blue-300"
                  : "bg-slate-700 border border-slate-600 text-white focus:border-indigo-500 focus:ring-indigo-500/30"
              }`}
            />
          </div>

          {/* Password */}
          <div className="space-y-1 mt-4">
            <label
              htmlFor="password"
              className={`block text-sm font-medium ${
                theme === "light" ? "text-gray-800" : "text-gray-200"
              }`}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className={`block w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition-all duration-300 ${
                theme === "light"
                  ? "bg-white border border-blue-200 text-gray-900 focus:border-blue-400 focus:ring-blue-300"
                  : "bg-slate-700 border border-slate-600 text-white focus:border-indigo-500 focus:ring-indigo-500/30"
              }`}
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1 mt-4">
            <label
              htmlFor="confirmPassword"
              className={`block text-sm font-medium ${
                theme === "light" ? "text-gray-800" : "text-gray-200"
              }`}
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`block w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition-all duration-300 ${
                theme === "light"
                  ? "bg-white border border-blue-200 text-gray-900 focus:border-blue-400 focus:ring-blue-300"
                  : "bg-slate-700 border border-slate-600 text-white focus:border-indigo-500 focus:ring-indigo-500/30"
              }`}
            />
          </div>

          {/* Button */}
          <div className="mt-6">
            <button
              type="submit"
              className={`w-full rounded-lg px-4 py-2.5 font-semibold transition-all duration-300 transform hover:scale-[1.03] ${
                theme === "light"
                  ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg hover:brightness-110"
                  : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg hover:shadow-indigo-700/50"
              }`}
            >
              Sign Up
            </button>
          </div>

          <p
            className={`mt-6 text-center text-sm ${
              theme === "light" ? "text-gray-600" : "text-gray-400"
            }`}
          >
            Already have an account?{" "}
            <Link
              to="/signIn"
              className={`font-semibold ${
                theme === "light"
                  ? "text-blue-600 hover:text-purple-600"
                  : "text-indigo-400 hover:text-indigo-300"
              }`}
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
