"use client";

import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToogle";
import {
  MessageCircle,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Lock,
  Smartphone,
} from "lucide-react";

export default function Landing() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "End-to-End Encrypted",
      description:
        "Your privacy is absolute. Messages are encrypted on your device and can only be read by the recipient.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description:
        "Built on modern WebSockets, delivering your messages in milliseconds without refreshing.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Connect Anywhere",
      description:
        "Access your conversations seamlessly across all your devices, anytime, anywhere.",
    },
  ];

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-all duration-500 font-sans ${
        isLight
          ? "bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-slate-800"
          : "bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#0B0F19] text-slate-100"
      }`}
    >
      {/* Dynamic Background Elements */}
      <div
        className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-30 ${
          isLight ? "bg-indigo-300" : "bg-indigo-900"
        }`}
        style={{ animation: "blob-float 15s ease-in-out infinite" }}
      />
      <div
        className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 ${
          isLight ? "bg-fuchsia-300" : "bg-fuchsia-900"
        }`}
        style={{ animation: "blob-float 20s ease-in-out infinite reverse" }}
      />

      {/* Navigation */}
      <nav
        className={`relative z-50 px-6 py-4 flex items-center justify-between border-b ${
          isLight
            ? "border-indigo-100 bg-white/50"
            : "border-slate-800 bg-[#0B0F19]/50"
        } backdrop-blur-md`}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              background: "linear-gradient(135deg, #6366F1, #D946EF)",
            }}
          >
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">CozyChat</span>
        </div>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <Link
            to="/login"
            className={`font-semibold text-sm transition-colors ${
              isLight ? "text-slate-600 hover:text-indigo-600" : "text-slate-300 hover:text-indigo-400"
            }`}
          >
            Log in
          </Link>
          <Link
            to="/signUp"
            className="px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #6366F1, #D946EF)",
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-24 pb-32 flex flex-col lg:flex-row items-center gap-16">
        {/* Left Copy */}
        <div className="flex-1 text-center lg:text-left">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8 shadow-sm ${
              isLight
                ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                : "bg-indigo-900/30 text-indigo-300 border border-indigo-500/30"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Now with End-to-End Encryption</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8">
            Connect with your people,{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(135deg, #6366F1, #D946EF)",
              }}
            >
              securely.
            </span>
          </h1>
          <p
            className={`text-lg lg:text-xl max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed ${
              isLight ? "text-slate-600" : "text-slate-400"
            }`}
          >
            CozyChat is a premium messaging experience designed for speed, privacy,
            and beautiful interactions. Drop the noise and chat comfortably.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Link
              to="/signUp"
              className="px-8 py-4 rounded-full text-base font-bold text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #6366F1, #D946EF)",
              }}
            >
              Start Chatting for Free <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className={`px-8 py-4 rounded-full text-base font-bold transition-all hover:-translate-y-1 ${
                isLight
                  ? "bg-white text-slate-800 shadow-md hover:shadow-lg"
                  : "bg-slate-800 text-white shadow-md hover:shadow-lg border border-slate-700"
              }`}
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Right Illustration (Mock Chat UI) */}
        <div className="flex-1 relative w-full max-w-lg lg:max-w-xl perspective-1000">
          <div
            className={`relative rounded-3xl overflow-hidden shadow-2xl border-4 transform rotate-y-[-5deg] rotate-x-[5deg] transition-transform duration-700 hover:rotate-0 ${
              isLight ? "border-white bg-slate-50" : "border-slate-800 bg-slate-900"
            }`}
          >
            {/* Mock Header */}
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${
                isLight ? "border-slate-200" : "border-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
                <div>
                  <div className={`h-4 w-24 rounded mb-1 ${isLight ? "bg-slate-200" : "bg-slate-700"}`} />
                  <div className="h-2 w-16 rounded bg-green-400" />
                </div>
              </div>
            </div>
            {/* Mock Messages */}
            <div className="p-6 space-y-4">
              <div className="flex justify-start">
                <div
                  className={`px-4 py-3 rounded-2xl rounded-tl-sm max-w-[80%] ${
                    isLight ? "bg-white shadow-sm text-slate-700" : "bg-slate-800 text-slate-200"
                  }`}
                >
                  Hey! The new design looks absolutely incredible ✨
                </div>
              </div>
              <div className="flex justify-end">
                <div
                  className="px-4 py-3 rounded-2xl rounded-tr-sm max-w-[80%] text-white"
                  style={{
                    background: "linear-gradient(135deg, #6366F1, #D946EF)",
                  }}
                >
                  Right? It feels so premium and snappy now!
                </div>
              </div>
              <div className="flex justify-start">
                <div
                  className={`px-4 py-3 rounded-2xl rounded-tl-sm max-w-[80%] ${
                    isLight ? "bg-white shadow-sm text-slate-700" : "bg-slate-800 text-slate-200"
                  }`}
                >
                  Plus, it's fully E2E encrypted 🔒
                </div>
              </div>
            </div>
            {/* Mock Input */}
            <div
              className={`p-4 border-t flex items-center gap-3 ${
                isLight ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900"
              }`}
            >
              <div className={`h-10 flex-1 rounded-full ${isLight ? "bg-slate-100" : "bg-slate-800"}`} />
              <div
                className="w-10 h-10 rounded-full flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #6366F1, #D946EF)",
                }}
              />
            </div>
          </div>

          {/* Floating Accents */}
          <div
            className="absolute -top-8 -right-8 w-24 h-24 rounded-2xl shadow-xl flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 animate-bounce"
            style={{ animationDuration: "3s" }}
          >
            <Smartphone className={`w-10 h-10 ${isLight ? "text-indigo-600" : "text-indigo-400"}`} />
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="relative z-10 container mx-auto px-6 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything you need to connect</h2>
          <p className={`max-w-xl mx-auto ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            We've built a platform that doesn't compromise on features, security, or aesthetics.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                isLight
                  ? "bg-white/60 border-indigo-50 hover:bg-white"
                  : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80"
              } backdrop-blur-sm`}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-md"
                style={{
                  background: "linear-gradient(135deg, #6366F1, #D946EF)",
                  color: "white",
                }}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className={`leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
      
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-y-\\[-5deg\\] {
          transform: rotateY(-5deg);
        }
        .rotate-x-\\[5deg\\] {
          transform: rotateX(5deg);
        }
        .hover\\:rotate-0:hover {
          transform: rotateY(0deg) rotateX(0deg);
        }
      `}</style>
    </div>
  );
}
