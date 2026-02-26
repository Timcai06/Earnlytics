"use client";

import { motion } from "framer-motion";
import { ReactNode, useState } from "react";

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export function AnimatedButton({
  children,
  onClick,
  disabled,
  loading,
  className = "",
  type = "button",
}: AnimatedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onTapCancel={() => setIsPressed(false)}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      animate={{
        scale: isPressed ? 0.98 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      className={`relative overflow-hidden ${className}`}
    >
      {loading && (
        <motion.div
          className="absolute inset-0 bg-primary/20"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "linear",
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverLift?: boolean;
  pressEffect?: boolean;
}

export function AnimatedCard({
  children,
  className = "",
  onClick,
  hoverLift = true,
  pressEffect = true,
}: AnimatedCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={
        hoverLift
          ? {
              y: -4,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
            }
          : undefined
      }
      whileTap={
        pressEffect
          ? {
              scale: 0.98,
            }
          : undefined
      }
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function AnimatedList({
  children,
  className = "",
  staggerDelay = 0.05,
}: AnimatedListProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedListItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      layout
      variants={{
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20, scale: 0.9 },
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ChartAnimationProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ChartAnimation({
  children,
  className = "",
  delay = 0,
}: ChartAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface TooltipAnimationProps {
  children: ReactNode;
  isVisible: boolean;
  className?: string;
}

export function TooltipAnimation({
  children,
  isVisible,
  className = "",
}: TooltipAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={
        isVisible
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 10, scale: 0.95 }
      }
      transition={{
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface FilterChangeAnimationProps {
  children: ReactNode;
  className?: string;
  filterKey: string;
}

export function FilterChangeAnimation({
  children,
  className = "",
  filterKey,
}: FilterChangeAnimationProps) {
  return (
    <motion.div
      key={filterKey}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function DataUpdateAnimation({
  children,
  className = "",
  dataKey,
}: {
  children: ReactNode;
  className?: string;
  dataKey: string | number;
}) {
  return (
    <motion.div
      key={dataKey}
      initial={{ opacity: 0.5, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
