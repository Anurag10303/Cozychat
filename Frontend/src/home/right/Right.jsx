import { AnimatePresence, motion } from "framer-motion";
import { Lock, MessagesSquare, Zap } from "lucide-react";
import Chatuser from "./Chatuser";
import Messages from "./Messages";
import TypeMsg from "./TypeMsg";
import useConversation from "../../zustand/userConveration";
import { useAuth } from "../../context/AuthProvider";
import { LogoMark } from "../../components/ui/Logo";
import { EASE, fadeUp, stagger } from "../../lib/motion";

function Welcome() {
  const [authUser] = useAuth();
  const firstName = authUser?.user?.fullName?.split(" ")[0];

  const points = [
    { icon: Lock, label: "End-to-end encrypted" },
    { icon: Zap, label: "Real-time delivery" },
    { icon: MessagesSquare, label: "Files, voice & media" },
  ];

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-8">
      <div className="bg-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

      <motion.div
        variants={stagger(0.08)}
        initial="hidden"
        animate="show"
        className="relative flex max-w-md flex-col items-center text-center"
      >
        <motion.div variants={fadeUp} className="relative mb-8">
          {/* Slow concentric rings: a quiet sign of life, not a spectacle */}
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-[28px] border border-accent/20"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.9, opacity: 0 }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 1.33, ease: "easeOut" }}
            />
          ))}
          <LogoMark size={76} className="relative drop-shadow-[0_12px_32px_rgba(108,108,240,0.35)]" />
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-balance text-[1.75rem] font-semibold tracking-[-0.03em] text-fg lg:text-[2rem]"
        >
          {firstName ? `Welcome back, ${firstName}` : "Welcome to CozyChat"}
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-muted">
          Pick a conversation from the sidebar to continue where you left off.
        </motion.p>

        <motion.ul variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-2">
          {points.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted shadow-soft"
            >
              <Icon className="h-3.5 w-3.5 text-accent-text" />
              {label}
            </li>
          ))}
        </motion.ul>
      </motion.div>
    </div>
  );
}

function Right() {
  const { selectedConversation } = useConversation();

  return (
    <main className="relative flex h-full w-full min-w-0 flex-col">
      <AnimatePresence mode="wait" initial={false}>
        {!selectedConversation ? (
          <motion.div
            key="welcome"
            className="h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Welcome />
          </motion.div>
        ) : (
          <motion.div
            key={selectedConversation._id}
            className="flex h-full min-h-0 flex-col"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <Chatuser />
            <div className="bg-dots relative min-h-0 flex-1">
              <Messages />
            </div>
            <TypeMsg />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default Right;
