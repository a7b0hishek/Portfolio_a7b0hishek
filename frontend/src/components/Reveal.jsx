import { motion, useReducedMotion } from 'framer-motion';

export default function Reveal({ children, className = '', delay = 0 }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, amount: 0.18 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}
