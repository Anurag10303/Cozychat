import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { ArrowRight, Check, Lock, Mail, User } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { useE2EE } from "../context/E2EEContext";
import BASE_URL from "../config";
import AvatarUpload from "./AvatarUpload";
import AuthShell from "./auth/AuthShell";
import Field from "./auth/Field";
import GoogleAuth from "./auth/GoogleAuth";
import Button from "./ui/Button";

const STRENGTH = [
  { label: "", color: "" },
  { label: "Weak", color: "var(--c-danger)" },
  { label: "Fair", color: "var(--c-warning)" },
  { label: "Good", color: "var(--c-accent)" },
  { label: "Strong", color: "var(--c-success)" },
];

export default function SignUp() {
  const navigate = useNavigate();
  const [, setAuthUser] = useAuth();
  const { bootstrapE2EE } = useE2EE();
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (file) => {
    setFormData((prev) => ({ ...prev, avatar: file }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setIsLoading(true);

    // Capture password before formData is cleared — needed for E2EE key bootstrap
    const passwordAtSignup = formData.password;

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

      // Persist auth state — bootstrapE2EE reads from localStorage so this
      // must happen before we call it.
      localStorage.setItem("RealChat", JSON.stringify({ token: data.token, user: data.user }));
      setAuthUser({ token: data.token, user: data.user });

      // Bootstrap E2EE keys for the new account while we still have the password.
      // For a brand-new user this always takes the "generate fresh keypair" path
      // in ensureKeyPairWithBackup, wraps the private key, and uploads the backup.
      await bootstrapE2EE(passwordAtSignup);

      toast.success("Account created successfully!");

      // Reset form now that we're done with the password
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        avatar: null,
      });

      // Navigate to the main app — user is now fully logged in with E2EE ready
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Error during SignUp:", error.message);
      toast.error(error.message || "SignUp failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength();
  const mismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your account"
      subtitle="It takes less than a minute. No credit card, no noise."
      panelTitle="A quieter place for the conversations that matter."
      panelCopy="CozyChat keeps things simple: fast, private messaging with the people you care about, and nothing in the way."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-accent-text hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <GoogleAuth mode="signup" />
      <form onSubmit={handleSubmit} className="space-y-5">
        <AvatarUpload onAvatarChange={handleAvatarChange} currentAvatarFile={formData.avatar} />

        <Field
          label="Full name"
          icon={User}
          name="fullName"
          type="text"
          autoComplete="name"
          required
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Your full name"
        />
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

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <Field
            label="Password"
            icon={Lock}
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
          />
          <Field
            label="Confirm password"
            icon={Lock}
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat password"
          />
        </div>

        {(formData.password || mismatch) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="-mt-2 space-y-1.5"
          >
            {formData.password && (
              <div className="flex items-center gap-3">
                <div className="flex flex-1 gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
                      <motion.span
                        className="block h-full rounded-full"
                        initial={false}
                        animate={{
                          width: i <= strength ? "100%" : "0%",
                          backgroundColor: STRENGTH[strength].color || "transparent",
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </span>
                  ))}
                </div>
                <span className="w-12 text-right text-xs font-medium" style={{ color: STRENGTH[strength].color }}>
                  {STRENGTH[strength].label}
                </span>
              </div>
            )}
            {mismatch && <p className="text-xs text-danger">Passwords don’t match yet.</p>}
          </motion.div>
        )}

        {/* Terms */}
        <label className="flex cursor-pointer items-start gap-3 select-none">
          <button
            type="button"
            role="checkbox"
            aria-checked={agreed}
            onClick={() => setAgreed(!agreed)}
            className={`mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors ${
              agreed ? "border-accent bg-accent text-accent-fg" : "border-line-strong bg-surface"
            }`}
          >
            <motion.span initial={false} animate={{ scale: agreed ? 1 : 0 }} transition={{ duration: 0.15 }}>
              <Check className="h-3 w-3" strokeWidth={3} />
            </motion.span>
          </button>
          <span className="text-[13px] leading-relaxed text-muted">
            I agree to the <span className="font-medium text-fg">Terms of Service</span> and{" "}
            <span className="font-medium text-fg">Privacy Policy</span>.
          </span>
        </label>

        <Button type="submit" size="lg" loading={isLoading} disabled={isLoading} className="w-full">
          Create account <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </AuthShell>
  );
}
