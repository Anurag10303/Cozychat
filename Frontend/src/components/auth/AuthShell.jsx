import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import Logo, { LogoMark } from "../ui/Logo";
import ThemeToggle from "../ThemeToogle";
import { EASE, fadeUp, stagger } from "../../lib/motion";

const POINTS = [
  "End-to-end encryption on every message",
  "Real-time delivery, typing and read receipts",
  "Share photos, video, voice notes and files",
];

function PreviewChat() {
  const bubbles = [
    { mine: false, text: "Are we still on for Saturday?" },
    { mine: true, text: "Absolutely. I’ll bring the coffee ☕" },
    { mine: false, text: "Perfect, see you then." },
  ];
  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-white/[0.07] p-4 shadow-2xl backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-xs font-semibold text-white">
          MR
        </div>
        <div>
          <p className="text-sm font-medium text-white">Maya Rao</p>
          <p className="flex items-center gap-1 text-[11px] text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online
          </p>
        </div>
        <Lock className="ml-auto h-3.5 w-3.5 text-white/50" />
      </div>
      <div className="space-y-2">
        {bubbles.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.35, duration: 0.4, ease: EASE }}
            className={`flex ${b.mine ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-[13px] ${
                b.mine ? "rounded-br-md bg-white text-[#3b3b9e]" : "rounded-bl-md bg-white/15 text-white"
              }`}
            >
              {b.text}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * Split layout for auth pages: a calm brand panel on large screens,
 * and a focused single-column form everywhere else.
 */
export default function AuthShell({ eyebrow, title, subtitle, children, footer, panelTitle, panelCopy }) {
  return (
    <div className="bg-ambient relative flex min-h-dvh w-full">
      {/* Brand panel (lg+) */}
      <aside className="relative hidden w-[44%] max-w-[640px] shrink-0 overflow-hidden lg:flex">
        <div className="brand-gradient absolute inset-0" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage: "radial-gradient(ellipse at 30% 40%, black, transparent 75%)",
          }}
        />
        <motion.div
          className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          variants={stagger(0.08, 0.1)}
          initial="hidden"
          animate="show"
          className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14"
        >
          <motion.div variants={fadeUp}>
            <Link to="/" className="inline-flex items-center gap-2.5" aria-label="CozyChat home">
              <span className="rounded-[10px] bg-white/15 p-0.5 ring-1 ring-white/25">
                <LogoMark size={32} />
              </span>
              <span className="text-lg font-semibold tracking-[-0.02em] text-white">CozyChat</span>
            </Link>
          </motion.div>

          <div className="space-y-8">
            <motion.div variants={fadeUp}>
              <h2 className="text-balance text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.03em] text-white xl:text-[2.625rem]">
                {panelTitle}
              </h2>
              <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-white/75">{panelCopy}</p>
            </motion.div>
            <motion.ul variants={fadeUp} className="space-y-3">
              {POINTS.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm text-white/85">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/20">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </motion.ul>
            <motion.div variants={fadeUp}>
              <PreviewChat />
            </motion.div>
          </div>

          <motion.p variants={fadeUp} className="text-xs text-white/55">
            © {new Date().getFullYear()} CozyChat
          </motion.p>
        </motion.div>
      </aside>

      {/* Form column */}
      <main className="relative flex min-h-dvh flex-1 flex-col">
        <div className="safe-top flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-6">
          <Link to="/" className="lg:invisible" aria-label="CozyChat home">
            <Logo size={32} />
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <motion.div
            variants={stagger(0.06, 0.05)}
            initial="hidden"
            animate="show"
            className="w-full max-w-[26rem]"
          >
            <motion.p
              variants={fadeUp}
              className="mb-2 text-xs font-semibold tracking-[0.12em] text-accent-text uppercase"
            >
              {eyebrow}
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-[1.75rem] leading-tight font-semibold tracking-[-0.03em] text-fg sm:text-[2rem]"
            >
              {title}
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-2 text-[0.9375rem] text-muted">
              {subtitle}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8">
              {children}
            </motion.div>

            {footer && (
              <motion.p variants={fadeUp} className="mt-8 text-center text-sm text-muted">
                {footer}
              </motion.p>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
