import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { useE2EE } from "../context/E2EEContext";
import BASE_URL from "../config";
import AuthShell from "./auth/AuthShell";
import Field from "./auth/Field";
import GoogleAuth from "./auth/GoogleAuth";
import Button from "./ui/Button";

export default function SignIn() {
  const [, setAuthUser] = useAuth();
  const { bootstrapE2EE } = useE2EE();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Arrived here because the previous session expired.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("expired")) {
      toast("Your session expired. Please sign in again.", { id: "session-expired" });
      window.history.replaceState(null, "", "/login");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Capture password before formData is cleared — needed for E2EE key bootstrap
    const passwordAtLogin = formData.password;

    try {
      const res = await fetch(`${BASE_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      if (!data.token) throw new Error("Authentication token missing");

      // Persist auth state — bootstrapE2EE reads from localStorage so this
      // must happen before we call it.
      localStorage.setItem("RealChat", JSON.stringify({ token: data.token, user: data.user }));
      setAuthUser({ token: data.token, user: data.user });

      // Bootstrap E2EE keys while we still have the plaintext password.
      // This will:
      //  - Restore keys from the server backup (returning user, same device or new)
      //  - OR generate a fresh key pair and back it up (brand new user)
      //  - OR use keys already in IndexedDB (same session / tab refresh)
      // The password is used only to derive a wrapping key and is discarded after.
      await bootstrapE2EE(passwordAtLogin);

      // Clear form now that we're done with the password
      setFormData({ email: "", password: "" });
      toast.success("Logged in successfully");
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to CozyChat"
      subtitle="Your conversations are right where you left them."
      panelTitle="Private conversations, beautifully simple."
      panelCopy="Pick up every thread instantly, on any device, with encryption that keeps what you say between you and the people you say it to."
      footer={
        <>
          New to CozyChat?{" "}
          <Link to="/signUp" className="font-medium text-accent-text hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <GoogleAuth mode="signin" />
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field
          label="Email"
          icon={Mail}
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
        />
        <Field
          label="Password"
          icon={Lock}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
        />

        <Button type="submit" size="lg" loading={isLoading} disabled={isLoading} className="w-full">
          Sign in <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </AuthShell>
  );
}
