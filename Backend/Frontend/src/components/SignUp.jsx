"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthProvider" // Assuming this path is correct
import { useTheme } from "../context/ThemeContext" // Assuming this path is correct
import { Link, useNavigate } from "react-router-dom" // Assuming react-router-dom is used
import BASE_URL from "../config" // Assuming this path is correct
import ThemeToggle from "./ThemeToogle" // Assuming this path is correct
import Cookies from "js-cookie" // Assuming js-cookie is used
import AvatarUpload from "./AvatarUpload" // Import the AvatarUpload component

export default function SignUp() {
  const [authUser, setAuthUser] = useAuth()
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: null, // This will store the File object
  })

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (file) => {
    setFormData((prev) => ({ ...prev, avatar: file }))
  }

  // SignUp.jsx
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
  if (formData.avatar) {
    formPayload.append("avatar", formData.avatar);
  }
  try {
    const response = await fetch(`${BASE_URL}/user/signUp`, {
      method: "POST",
      body: formPayload,
      credentials: "include", // Ensure cookies are sent and received
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Signup failed");
    alert("Registration successful!");
    if (data.token) {
      Cookies.set("jwt", data.token, { expires: 7, secure: process.env.NODE_ENV === "production", sameSite: "Strict" });
    } else {
      console.error("No token in response:", data);
      throw new Error("Authentication token missing from server response");
    }
    localStorage.setItem("ChatAPP", JSON.stringify(data));
    console.log("Stored data:", JSON.stringify(data));
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
      className={`min-h-screen flex flex-col justify-center px-6 py-12 lg:px-8 ${
        theme === "light"
          ? "bg-gradient-to-br from-blue-50 via-white to-purple-50"
          : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      }`}
    >
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2
          className={`text-center text-2xl font-bold mb-6 ${
            theme === "light"
              ? "text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text"
              : "text-white"
          }`}
        >
          Sign up for an account
        </h2>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <form
          onSubmit={handleSubmit}
          className={`space-y-6 p-8 rounded-2xl ${
            theme === "light"
              ? "bg-white/80 backdrop-blur-sm shadow-xl border border-blue-200"
              : "bg-slate-800/50 backdrop-blur-sm shadow-2xl border border-slate-700"
          }`}
        >
          {/* Avatar Upload Integration */}
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}
            >
              Upload Avatar
            </label>
            <AvatarUpload onAvatarChange={handleAvatarChange} currentAvatarFile={formData.avatar} />
          </div>
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className={`block text-sm font-medium ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}
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
              className={`block w-full rounded-lg px-3 py-2 ${
                theme === "light"
                  ? "bg-white border border-blue-200 text-gray-900"
                  : "bg-slate-700 border border-slate-600 text-white"
              }`}
            />
          </div>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className={`block text-sm font-medium ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}
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
              className={`block w-full rounded-lg px-3 py-2 ${
                theme === "light"
                  ? "bg-white border border-blue-200 text-gray-900"
                  : "bg-slate-700 border border-slate-600 text-white"
              }`}
            />
          </div>
          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className={`block text-sm font-medium ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}
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
              className={`block w-full rounded-lg px-3 py-2 ${
                theme === "light"
                  ? "bg-white border border-blue-200 text-gray-900"
                  : "bg-slate-700 border border-slate-600 text-white"
              }`}
            />
          </div>
          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className={`block text-sm font-medium ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}
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
              className={`block w-full rounded-lg px-3 py-2 ${
                theme === "light"
                  ? "bg-white border border-blue-200 text-gray-900"
                  : "bg-slate-700 border border-slate-600 text-white"
              }`}
            />
          </div>
          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className={`w-full rounded-lg px-4 py-2 font-semibold transition ${
                theme === "light"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                  : "bg-blue-700 text-white hover:bg-blue-600"
              }`}
            >
              Sign Up
            </button>
          </div>
          <p className={`mt-4 text-center text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
            Already have an account?{" "}
            <Link
              to="/signIn"
              className={`font-semibold ${
                theme === "light" ? "text-blue-600 hover:text-purple-600" : "text-blue-400 hover:text-blue-300"
              }`}
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
