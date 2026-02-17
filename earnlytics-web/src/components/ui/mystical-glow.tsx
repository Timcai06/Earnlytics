"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const CORE_GRADIENT =
  "radial-gradient(circle at center, #000000 0%, #000000 12%, rgba(139,92,246,0.95) 22%, rgba(124,58,237,0.8) 30%, rgba(99,102,241,0.6) 45%, rgba(76,29,149,0.4) 60%, rgba(49,46,129,0.2) 75%, transparent 90%)";

const OUTER_GRADIENT =
  "radial-gradient(circle at center, transparent 30%, rgba(139,92,246,0.3) 50%, rgba(99,102,241,0.2) 70%, transparent 90%)";

interface MysticalGlowProps {
  mousePosition?: { x: number; y: number };
}

export default function MysticalGlow({ mousePosition }: MysticalGlowProps) {
  const x = useSpring(0, { stiffness: 50, damping: 20 });
  const y = useSpring(0, { stiffness: 50, damping: 20 });

  useEffect(() => {
    if (mousePosition) {
      x.set(mousePosition.x);
      y.set(mousePosition.y);
    }
  }, [mousePosition, x, y]);

  // Map mouse movement (-0.5 to 0.5) to a subtle pixel shift
  const coreX = useTransform(x, [-0.5, 0.5], [-30, 30]);
  const coreY = useTransform(y, [-0.5, 0.5], [-30, 30]);
  const outerX = useTransform(x, [-0.5, 0.5], [-20, 20]);
  const outerY = useTransform(y, [-0.5, 0.5], [-20, 20]);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <motion.div
        className="animate-glow-core absolute left-1/2 top-1/2 -ml-[175px] -mt-[175px] h-[350px] w-[350px] blur-[25px]"
        style={{
          background: CORE_GRADIENT,
          x: coreX,
          y: coreY
        }}
      />
      <motion.div
        className="animate-glow-outer absolute left-1/2 top-1/2 -ml-[225px] -mt-[225px] h-[450px] w-[450px] blur-[35px]"
        style={{
          background: OUTER_GRADIENT,
          x: outerX,
          y: outerY
        }}
      />
    </div>
  );
}
