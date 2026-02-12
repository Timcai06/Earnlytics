"use client";

export default function MysticalGlow() {
  return (
    <>
      <div
        className="animate-glow-core pointer-events-none"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          marginLeft: "-175px",
          marginTop: "-175px",
          width: "350px",
          height: "350px",
          background: `
            radial-gradient(circle at center,
              #000000 0%,
              #000000 12%,
              rgba(139, 92, 246, 0.95) 22%,
              rgba(124, 58, 237, 0.8) 30%,
              rgba(99, 102, 241, 0.6) 45%,
              rgba(76, 29, 149, 0.4) 60%,
              rgba(49, 46, 129, 0.2) 75%,
              transparent 90%
            )
          `,
          filter: "blur(25px)",
          zIndex: 0,
        }}
      />

      <div
        className="animate-glow-outer pointer-events-none"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          marginLeft: "-225px",
          marginTop: "-225px",
          width: "450px",
          height: "450px",
          background: `
            radial-gradient(circle at center,
              transparent 30%,
              rgba(139, 92, 246, 0.3) 50%,
              rgba(99, 102, 241, 0.2) 70%,
              transparent 90%
            )
          `,
          filter: "blur(35px)",
          zIndex: 0,
        }}
      />

      <style jsx>{`
        @keyframes glow-core {
          0%, 100% {
            opacity: 0.85;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes glow-outer {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.9;
          }
        }

        .animate-glow-core {
          animation: glow-core 4s ease-in-out infinite;
        }

        .animate-glow-outer {
          animation: glow-outer 6s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
