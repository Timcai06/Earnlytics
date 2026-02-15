"use client";

const CORE_GRADIENT =
  "radial-gradient(circle at center, #000000 0%, #000000 12%, rgba(139,92,246,0.95) 22%, rgba(124,58,237,0.8) 30%, rgba(99,102,241,0.6) 45%, rgba(76,29,149,0.4) 60%, rgba(49,46,129,0.2) 75%, transparent 90%)";

const OUTER_GRADIENT =
  "radial-gradient(circle at center, transparent 30%, rgba(139,92,246,0.3) 50%, rgba(99,102,241,0.2) 70%, transparent 90%)";

export default function MysticalGlow() {
  return (
    <>
      <div
        className="animate-glow-core pointer-events-none absolute left-1/2 top-1/2 -ml-[175px] -mt-[175px] z-0 h-[350px] w-[350px] blur-[25px]"
        style={{ background: CORE_GRADIENT }}
      />
      <div
        className="animate-glow-outer pointer-events-none absolute left-1/2 top-1/2 -ml-[225px] -mt-[225px] z-0 h-[450px] w-[450px] blur-[35px]"
        style={{ background: OUTER_GRADIENT }}
      />
    </>
  );
}
