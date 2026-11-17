'use client';
import { motion, useReducedMotion } from 'motion/react';

/* Re-mounts on every admin navigation, so each page eases in. */
export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className="admin-x__page"
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 0.61, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
