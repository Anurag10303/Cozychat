import { AnimatePresence, motion } from "framer-motion";
import useConversation from "../../zustand/userConveration.js";
import { useSocketContext } from "../../context/SocketContext.jsx";
import Avatar from "../../components/ui/Avatar";
import { spring } from "../../lib/motion";

export function User({ user }) {
  const { onlineUser } = useSocketContext();
  const isOnline = user.isOnline ?? onlineUser.includes(String(user._id));
  const { selectedConversation, setSelectedConversation } = useConversation();
  const isSelected = selectedConversation?._id === user._id;
  const unread = !isSelected ? user.unreadCount || 0 : 0;

  return (
    <button
      type="button"
      onClick={() => setSelectedConversation(user)}
      aria-current={isSelected ? "true" : undefined}
      className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 hover:bg-surface-2 focus-visible:outline-offset-[-2px] active:bg-surface-3"
    >
      {/* Shared highlight glides between rows as the selection changes */}
      {isSelected && (
        <motion.span
          layoutId="conversation-highlight"
          transition={spring}
          className="absolute inset-0 rounded-xl border border-accent/15 bg-accent-soft"
        />
      )}

      <Avatar
        name={user.fullName}
        src={user.avatar}
        size={44}
        online={isOnline}
        ringClass={isSelected ? "border-surface" : "border-elevated"}
        className="relative"
      />

      <span className="relative min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span
            className={`truncate text-[0.9375rem] tracking-[-0.01em] ${
              unread ? "font-semibold text-fg" : "font-medium text-fg"
            }`}
          >
            {user.fullName}
          </span>
          <AnimatePresence>
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={spring}
                className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full brand-gradient px-1.5 text-[11px] font-semibold text-accent-fg tabular-nums"
                aria-label={`${unread} unread`}
              >
                {unread > 99 ? "99+" : unread}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[0.8125rem] text-muted">
          {isOnline ? (
            <span className="shrink-0 font-medium text-success">Online</span>
          ) : null}
          {isOnline && <span className="text-subtle">·</span>}
          <span className="truncate">{user.email}</span>
        </span>
      </span>
    </button>
  );
}

export default User;
