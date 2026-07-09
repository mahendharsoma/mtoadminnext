export const springSnappy = { type: "spring" as const, stiffness: 420, damping: 32 };
export const springSmooth = { type: "spring" as const, stiffness: 280, damping: 30 };

export const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18 } },
};

export const fadeUpVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: springSnappy },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

export const dropdownVariants = {
  initial: { opacity: 0, scale: 0.96, y: -6 },
  animate: { opacity: 1, scale: 1, y: 0, transition: springSnappy },
  exit: { opacity: 0, scale: 0.98, y: -4, transition: { duration: 0.12 } },
};
