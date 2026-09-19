import { motion } from "framer-motion";

const VARIANTS = {
  primary:
    "bubble-gradient text-accent-fg shadow-accent hover:brightness-110 disabled:opacity-60 disabled:shadow-none",
  secondary: "border border-line bg-surface text-fg shadow-soft hover:bg-surface-2",
  ghost: "text-muted hover:bg-surface-2 hover:text-fg",
};

const SIZES = {
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-12 px-6 text-[0.9375rem]",
  sm: "h-9 px-3.5 text-sm",
};

// Cache motion wrappers so components like <Link> keep a stable identity across renders.
const motionCache = new Map();
function toMotion(Component) {
  if (typeof Component === "string") return motion[Component];
  if (!motionCache.has(Component)) motionCache.set(Component, motion.create(Component));
  return motionCache.get(Component);
}

export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  ...props
}) {
  const MotionComponent = toMotion(Component);
  return (
    <MotionComponent
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-[-0.01em] transition-colors duration-200 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80" />
      ) : (
        children
      )}
    </MotionComponent>
  );
}
