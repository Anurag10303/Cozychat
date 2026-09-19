// Shared motion language: short, eased, never bouncy enough to distract.
export const EASE = [0.22, 1, 0.36, 1];

export const spring = { type: "spring", stiffness: 420, damping: 34, mass: 0.8 };
export const softSpring = { type: "spring", stiffness: 260, damping: 30 };

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: EASE } },
};

export const stagger = (gap = 0.06, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: EASE } },
};
