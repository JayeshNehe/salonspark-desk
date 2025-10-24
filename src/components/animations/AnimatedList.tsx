import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedListProps {
  children: ReactNode[];
  className?: string;
}

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const listItemVariants = {
  hidden: { 
    opacity: 0, 
    x: -20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

export function AnimatedList({ children, className }: AnimatedListProps) {
  return (
    <motion.div
      variants={listContainerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={listItemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
