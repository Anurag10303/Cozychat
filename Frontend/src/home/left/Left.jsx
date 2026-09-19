import { useMemo, useState } from "react";
import LogOut from "./LogOut";
import Search from "./Search";
import Users from "./Users";
import ThemeToggle from "../../components/ThemeToogle";
import Logo from "../../components/ui/Logo";
import useGetAllUsers from "../../context/useGetAllUsers";
import useConversation from "../../zustand/userConveration";

function Left() {
  // Fetched once here and shared, so the list and search stay in sync.
  const [allUsers, loading] = useGetAllUsers();
  const { setSelectedConversation } = useConversation();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter(
      (u) => u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q),
    );
  }, [allUsers, query]);

  const onlineCount = allUsers.filter((u) => u.isOnline).length;

  const selectFirstMatch = () => {
    if (filtered[0]) {
      setSelectedConversation(filtered[0]);
      setQuery("");
    }
  };

  return (
    <aside className="safe-top flex h-full w-full flex-col border-r border-line bg-sidebar">
      <header className="flex flex-col gap-4 px-4 pt-4 pb-3 sm:px-5">
        <div className="flex items-center justify-between">
          <Logo size={34} />
          <ThemeToggle />
        </div>

        <div className="flex items-end justify-between">
          <h2 className="text-[1.375rem] font-semibold tracking-[-0.02em] text-fg">Chats</h2>
          {!loading && allUsers.length > 0 && (
            <span className="mb-1 inline-flex items-center gap-1.5 text-xs text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-online" />
              {onlineCount} online
            </span>
          )}
        </div>

        <Search value={query} onChange={setQuery} onSubmit={selectFirstMatch} />
      </header>

      <div className="min-h-0 flex-1">
        <Users users={filtered} loading={loading} query={query} />
      </div>

      <footer className="border-t border-line">
        <LogOut />
      </footer>
    </aside>
  );
}

export default Left;
