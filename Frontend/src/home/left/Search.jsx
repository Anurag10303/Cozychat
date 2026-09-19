import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search as SearchIcon, X } from "lucide-react";

const IS_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);

function Search({ value, onChange, onSubmit }) {
  const inputRef = useRef(null);

  // "/" or Ctrl/⌘+K focuses search from anywhere (except while typing elsewhere).
  useEffect(() => {
    const onKey = (e) => {
      const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="group relative"
    >
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-subtle transition-colors group-focus-within:text-accent" />
      <input
        ref={inputRef}
        type="search"
        inputMode="search"
        enterKeyHint="search"
        placeholder="Search people"
        aria-label="Search people"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onChange("")}
        className="h-11 w-full rounded-xl border border-line bg-surface-2 pr-16 pl-10 text-[16px] text-fg transition-[border-color,box-shadow,background-color] duration-200 outline-none placeholder:text-subtle focus:border-accent focus:bg-surface focus:ring-4 focus:ring-ring sm:h-10 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center">
        <AnimatePresence initial={false} mode="wait">
          {value ? (
            <motion.button
              key="clear"
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                onChange("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="grid h-6 w-6 place-items-center rounded-md text-subtle hover:bg-surface-3 hover:text-fg"
            >
              <X className="h-3.5 w-3.5" />
            </motion.button>
          ) : (
            <motion.kbd
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none hidden rounded-md border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] text-subtle md:inline-block"
            >
              {IS_MAC ? "⌘K" : "Ctrl K"}
            </motion.kbd>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}

export default Search;
