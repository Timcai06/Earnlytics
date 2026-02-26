"use client";

interface HorizontalGlowProps {
  position?: "middle" | "bottom"
}

export default function HorizontalGlow({ position = "middle" }: HorizontalGlowProps) {
  const topValue = position === "bottom" ? "100%" : "50%"
  
  return (
    <>
      <div
        className="animate-h-glow pointer-events-none"
        style={{
          position: "absolute",
          left: "10%",
          right: "10%",
          top: topValue,
          marginTop: position === "bottom" ? "24px" : "-1px",
          height: "2px",
          background: `
            linear-gradient(90deg,
              transparent 0%,
              rgba(139, 92, 246, 0) 10%,
              rgba(139, 92, 246, 0.8) 25%,
              rgba(139, 92, 246, 1) 50%,
              rgba(139, 92, 246, 0.8) 75%,
              rgba(139, 92, 246, 0) 90%,
              transparent 100%
            )
          `,
          boxShadow: `
            0 0 10px rgba(139, 92, 246, 0.8),
            0 0 20px rgba(139, 92, 246, 0.6),
            0 0 40px rgba(139, 92, 246, 0.4),
            0 0 80px rgba(139, 92, 246, 0.2)
          `,
          zIndex: 0,
        }}
      />

      <style jsx>{`
        @keyframes h-glow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-h-glow {
          animation: h-glow 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
