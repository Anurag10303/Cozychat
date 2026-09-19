import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import {
  ArrowRight,
  CheckCheck,
  FileText,
  KeyRound,
  Lock,
  MonitorSmartphone,
  Paperclip,
  Radio,
  SendHorizontal,
  ShieldCheck,
  Smile,
  Zap,
} from "lucide-react";
import Logo, { LogoMark } from "./ui/Logo";
import ThemeToggle from "./ThemeToogle";
import Button from "./ui/Button";
import { EASE, fadeUp, stagger } from "../lib/motion";

/* ───────────────────────── Nav ───────────────────────── */
function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  return (
    <header
      className={`safe-top sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled ? "border-b border-line bg-bar" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" aria-label="CozyChat home">
          <Logo size={32} />
        </Link>

        <div className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="#features" className="transition-colors hover:text-fg">Features</a>
          <a href="#security" className="transition-colors hover:text-fg">Security</a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            to="/login"
            className="hidden h-9 items-center rounded-xl px-3 text-sm font-medium text-muted transition-colors hover:text-fg xs:inline-flex"
          >
            Sign in
          </Link>
          <Button as={Link} to="/signUp" size="sm">
            Get started
          </Button>
        </div>
      </nav>
    </header>
  );
}

/* ───────────────────── Hero preview ───────────────────── */
const SCRIPT = [
  { mine: false, text: "Did the photos from the trip come through?" },
  { mine: true, file: true },
  { mine: true, text: "All 48 of them 😄 Encrypted end to end, too." },
  { mine: false, text: "You’re the best. Dinner Friday?" },
];

function PreviewBubble({ m }) {
  if (m.file) {
    return (
      <div className="flex items-center gap-3 rounded-2xl rounded-br-md bg-bubble-out bubble-gradient px-3 py-2.5 text-bubble-out-fg">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/20">
          <FileText className="h-4 w-4" />
        </span>
        <span className="text-left">
          <span className="block text-[13px] font-medium">Lisbon-trip.zip</span>
          <span className="block text-[11px] text-white/70">24.8 MB</span>
        </span>
      </div>
    );
  }
  return (
    <div
      className={`rounded-2xl px-3.5 py-2 text-[13.5px] leading-snug ${
        m.mine
          ? "rounded-br-md bg-bubble-out bubble-gradient text-bubble-out-fg"
          : "rounded-bl-md border border-line bg-bubble-in text-bubble-in-fg shadow-soft"
      }`}
    >
      {m.text}
    </div>
  );
}

function ChatPreview() {
  const [step, setStep] = useState(0);

  // Reveal the script one message at a time, pause, then loop.
  useEffect(() => {
    const done = step >= SCRIPT.length + 2;
    const t = setTimeout(() => setStep(done ? 0 : step + 1), done ? 600 : step === 0 ? 700 : 1500);
    return () => clearTimeout(t);
  }, [step]);

  const visible = SCRIPT.slice(0, Math.min(step, SCRIPT.length));
  const typing = step > 0 && step < SCRIPT.length && !SCRIPT[step]?.mine;

  const contacts = [
    { n: "Maya Rao", i: "MR", t: 0, on: true, active: true },
    { n: "Daniel Kim", i: "DK", t: 3, on: true },
    { n: "Priya Shah", i: "PS", t: 1 },
    { n: "Leo Martins", i: "LM", t: 2 },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[34rem]">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-accent/10 blur-3xl" />
      <div className="overflow-hidden rounded-3xl border border-line bg-elevated shadow-float">
        {/* window chrome */}
        <div className="flex h-10 items-center gap-1.5 border-b border-line px-4">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full bg-surface-3" />
          ))}
          <span className="mx-auto flex items-center gap-1.5 text-[11px] text-subtle">
            <Lock className="h-3 w-3" /> cozychat.app
          </span>
        </div>

        <div className="flex h-[22rem] sm:h-[24rem]">
          {/* sidebar */}
          <div className="hidden w-44 shrink-0 border-r border-line p-2 sm:block">
            {contacts.map((c) => (
              <div
                key={c.n}
                className={`mb-0.5 flex items-center gap-2 rounded-lg px-2 py-2 ${c.active ? "bg-accent-soft" : ""}`}
              >
                <span className="relative">
                  <span
                    className="grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold"
                    style={{ background: `var(--av-${c.t}-bg)`, color: `var(--av-${c.t}-fg)` }}
                  >
                    {c.i}
                  </span>
                  {c.on && (
                    <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-elevated bg-online" />
                  )}
                </span>
                <span className="truncate text-xs font-medium text-fg">{c.n}</span>
              </div>
            ))}
          </div>

          {/* conversation */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-2.5 border-b border-line px-4 py-2.5">
              <span
                className="grid h-8 w-8 place-items-center rounded-full text-[11px] font-semibold"
                style={{ background: "var(--av-0-bg)", color: "var(--av-0-fg)" }}
              >
                MR
              </span>
              <div className="leading-tight">
                <p className="text-[13px] font-semibold text-fg">Maya Rao</p>
                <p className="text-[11px] text-success">Online</p>
              </div>
            </div>

            <div className="bg-dots flex flex-1 flex-col justify-end gap-1.5 overflow-hidden px-3 py-3 sm:px-4">
              <AnimatePresence initial={false}>
                {visible.map((m, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className={`flex ${m.mine ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[82%]">
                      <PreviewBubble m={m} />
                      {m.mine && i === visible.length - 1 && (
                        <div className="mt-0.5 flex justify-end">
                          <CheckCheck className="h-3.5 w-3.5 text-seen" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {typing && (
                  <motion.div
                    key="typing"
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex"
                  >
                    <div className="flex h-8 items-center gap-1 rounded-2xl rounded-bl-md border border-line bg-bubble-in px-3.5">
                      {[0, 1, 2].map((d) => (
                        <motion.span
                          key={d}
                          className="h-1.5 w-1.5 rounded-full bg-subtle"
                          animate={{ y: [0, -3, 0], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 border-t border-line p-2.5">
              <Paperclip className="h-4 w-4 shrink-0 text-subtle" />
              <div className="flex h-9 flex-1 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs text-subtle">
                <Smile className="h-4 w-4" /> Write a message…
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-xl bubble-gradient text-accent-fg">
                <SendHorizontal className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Sections ───────────────────────── */
const FEATURES = [
  {
    icon: ShieldCheck,
    title: "End-to-end encrypted",
    body: "Messages are encrypted on your device and can only be read by the person you send them to.",
  },
  {
    icon: Zap,
    title: "Instant by design",
    body: "Built on WebSockets, so messages, typing indicators and read receipts arrive the moment they happen.",
  },
  {
    icon: Paperclip,
    title: "Rich media",
    body: "Share photos, video, voice notes and documents, with previews that feel native to the conversation.",
  },
  {
    icon: Radio,
    title: "Presence that respects you",
    body: "See who’s around at a glance with quiet online indicators, never an attention-grabbing feed.",
  },
  {
    icon: CheckCheck,
    title: "Delivery you can trust",
    body: "Clear sent, delivered and seen states so you always know where a message stands.",
  },
  {
    icon: MonitorSmartphone,
    title: "Every screen",
    body: "A layout that adapts from a small phone to an ultrawide monitor, in light or dark.",
  },
];

function Section({ id, eyebrow, title, copy, children }) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger(0.08)}
        className="mx-auto mb-12 max-w-2xl text-center sm:mb-16"
      >
        <motion.p variants={fadeUp} className="mb-3 text-xs font-semibold tracking-[0.14em] text-accent-text uppercase">
          {eyebrow}
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="text-balance text-[1.875rem] leading-[1.15] font-semibold tracking-[-0.03em] text-fg sm:text-[2.5rem]"
        >
          {title}
        </motion.h2>
        {copy && (
          <motion.p variants={fadeUp} className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {copy}
          </motion.p>
        )}
      </motion.div>
      {children}
    </section>
  );
}

function Features() {
  return (
    <Section
      id="features"
      eyebrow="Features"
      title="Everything a conversation needs. Nothing it doesn’t."
      copy="CozyChat keeps the essentials fast, private and pleasant, so the only thing you notice is who you’re talking to."
    >
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={stagger(0.07)}
        className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <motion.div
            key={title}
            variants={fadeUp}
            className="group bg-elevated p-7 transition-colors duration-300 hover:bg-surface sm:p-8"
          >
            <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl border border-line bg-accent-softer text-accent-text transition-transform duration-300 group-hover:-translate-y-0.5">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-fg">{title}</h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{body}</p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

function Security() {
  const steps = [
    {
      icon: KeyRound,
      title: "Keys stay with you",
      body: "A key pair is generated on your device. Your private key is wrapped with your password before any backup.",
    },
    {
      icon: Lock,
      title: "Sealed before sending",
      body: "Each message is encrypted in your browser before it ever touches the network.",
    },
    {
      icon: ShieldCheck,
      title: "Opened only by them",
      body: "Only the recipient’s device can decrypt it. The server relays ciphertext it cannot read.",
    },
  ];

  return (
    <Section
      id="security"
      eyebrow="Security"
      title={
        <>
          Private by default, <span className="font-serif font-normal italic">not</span> by setting.
        </>
      }
      copy="End-to-end encryption isn’t a toggle buried in preferences. It’s how every conversation on CozyChat works."
    >
      <motion.ol
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={stagger(0.12)}
        className="relative grid gap-4 md:grid-cols-3 md:gap-6"
      >
        {/* connecting line on desktop */}
        <motion.span
          aria-hidden="true"
          className="absolute top-9 right-[16%] left-[16%] hidden h-px origin-left bg-gradient-to-r from-transparent via-line-strong to-transparent md:block"
          variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1, ease: EASE } } }}
        />
        {steps.map(({ icon: Icon, title, body }, i) => (
          <motion.li
            key={title}
            variants={fadeUp}
            className="relative rounded-2xl border border-line bg-elevated p-6 text-center shadow-soft sm:p-7"
          >
            <div className="relative mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl brand-gradient text-accent-fg shadow-accent">
              <Icon className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center rounded-full border border-line bg-elevated font-mono text-[10px] font-medium text-muted">
                {i + 1}
              </span>
            </div>
            <h3 className="text-base font-semibold text-fg">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
          </motion.li>
        ))}
      </motion.ol>
    </Section>
  );
}

function CallToAction() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative overflow-hidden rounded-[2rem] px-6 py-14 text-center sm:px-12 sm:py-20"
      >
        <div className="brand-gradient absolute inset-0" />
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "radial-gradient(ellipse at center, black, transparent 70%)",
          }}
        />
        <div className="relative">
          <LogoMark size={52} className="mx-auto mb-6 rounded-[14px] ring-1 ring-white/30" />
          <h2 className="text-balance text-[1.875rem] leading-tight font-semibold tracking-[-0.03em] text-white sm:text-[2.5rem]">
            Start a better conversation today.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-white/80">
            Create your account in under a minute. Free, private, and ready on every device.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button as={Link} to="/signUp" size="lg" className="w-full !bg-white !text-[#3b3b9e] !shadow-lg hover:!bg-white/90 sm:w-auto">
              Create free account <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              as={Link}
              to="/login"
              size="lg"
              variant="ghost"
              className="w-full !text-white hover:!bg-white/10 sm:w-auto"
            >
              I already have an account
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="safe-bottom mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted sm:flex-row sm:px-8">
        <Logo size={26} />
        <p>© {new Date().getFullYear()} CozyChat. Made for the people who matter.</p>
      </div>
    </footer>
  );
}

/* ───────────────────────── Page ───────────────────────── */
export default function Landing() {
  return (
    <div className="bg-ambient min-h-dvh overflow-x-clip text-fg">
      <Nav />

      <main>
        <section className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pt-12 pb-16 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pt-24 lg:pb-28">
          <div
            aria-hidden="true"
            className="bg-dots pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_65%)]"
          />
          <motion.div
            variants={stagger(0.08, 0.05)}
            initial="hidden"
            animate="show"
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeUp}>
              <a
                href="#security"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-elevated/80 py-1 pr-3 pl-1 text-xs font-medium text-muted shadow-soft backdrop-blur transition-colors hover:text-fg"
              >
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-accent-text">
                  <Lock className="h-3 w-3" /> E2EE
                </span>
                Encrypted end to end, by default
                <ArrowRight className="h-3 w-3" />
              </a>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-6 text-balance text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.04em] text-fg xs:text-[2.875rem] sm:text-[3.5rem] lg:text-[4rem]"
            >
              Stay close to your people,{" "}
              <span className="font-serif font-normal tracking-[-0.02em] text-accent-text italic">privately.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-muted sm:text-lg lg:mx-0"
            >
              CozyChat is a calm, real-time messenger with end-to-end encryption, rich media and a
              design that stays out of your way.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-9 flex flex-col items-stretch justify-center gap-3 xs:flex-row xs:items-center lg:justify-start"
            >
              <Button as={Link} to="/signUp" size="lg">
                Start chatting free <ArrowRight className="h-4 w-4" />
              </Button>
              <Button as="a" href="#features" size="lg" variant="secondary">
                See how it works
              </Button>
            </motion.div>

            <motion.ul
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-muted lg:justify-start"
            >
              {["Free to use", "No ads", "Works on any device"].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <CheckCheck className="h-3.5 w-3.5 text-success" /> {t}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          >
            <ChatPreview />
          </motion.div>
        </section>

        <Features />
        <Security />
        <CallToAction />
      </main>

      <Footer />
    </div>
  );
}
