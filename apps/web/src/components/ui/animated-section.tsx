"use client";

import type { ReactNode } from "react";

import { motion, type HTMLMotionProps } from "motion/react";

export interface AnimatedSectionProps extends HTMLMotionProps<"div"> {
  children?: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  once = true,
  initial = { opacity: 0, scale: 0.95 },
  whileInView = { opacity: 1, scale: 1 },
  viewport,
  transition,
  ...props
}: AnimatedSectionProps) {
  return (
    <motion.div
      initial={initial}
      whileInView={whileInView}
      viewport={{ once, amount: 0.15, ...viewport }}
      transition={{ duration: 0.35, delay, ease: "easeOut", ...transition }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
