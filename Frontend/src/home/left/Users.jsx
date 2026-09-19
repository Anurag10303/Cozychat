import { motion } from "framer-motion";
import { SearchX, Users as UsersIcon } from "lucide-react";
import User from "./User";
import { EASE } from "../../lib/motion";

function SkeletonRow({ i }) {
  return (
    <div className="flex items-center gap-3 px-3 py-3" style={{ opacity: 1 - i * 0.12 }}>
      <div className="skeleton h-11 w-11 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-2/3 rounded-full" />
        <div className="skeleton h-2.5 w-1/2 rounded-full" />
      </div>
    </div>
  );
}

function EmptyState({ query }) {
  const Icon = query ? SearchX : UsersIcon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="flex flex-col items-center px-6 py-14 text-center"
    >
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-line bg-surface-2 text-subtle">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-fg">{query ? "No matches" : "No people yet"}</p>
      <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-muted">
        {query ? (
          <>
            Nobody matches “<span className="text-fg">{query}</span>”. Try a name or email.
          </>
        ) : (
          "When others join CozyChat, they’ll appear here."
        )}
      </p>
    </motion.div>
  );
}

function Users({ users, loading, query }) {
  if (loading) {
    return (
      <div className="px-2 pt-1 sm:px-3" aria-busy="true" aria-label="Loading conversations">
        {Array.from({ length: 7 }, (_, i) => (
          <SkeletonRow key={i} i={i} />
        ))}
      </div>
    );
  }

  if (users.length === 0) return <EmptyState query={query} />;

  return (
    <nav aria-label="Conversations" className="scroll-thin h-full overflow-y-auto px-2 pt-1 pb-3 sm:px-3">
      <motion.ul
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035 } } }}
        className="space-y-0.5"
      >
        {users.map((user) => (
          <motion.li
            key={user._id}
            layout="position"
            variants={{
              hidden: { opacity: 0, y: 6 },
              show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
            }}
          >
            <User user={user} />
          </motion.li>
        ))}
      </motion.ul>
    </nav>
  );
}

export default Users;
