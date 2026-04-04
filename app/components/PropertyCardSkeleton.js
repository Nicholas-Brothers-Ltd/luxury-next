export default function PropertyCardSkeleton() {
  return (
    <div style={{
      borderRadius: "16px",
      overflow: "hidden",
      background: "#111",
      position: "relative"
    }}>
      {/* shimmer */}
      <div className="shimmer" />

      <div style={{ height: "200px", background: "#222" }} />

      <div style={{ padding: "16px" }}>
        <div style={{ height: "16px", background: "#222", marginBottom: "10px" }} />
        <div style={{ height: "12px", background: "#222", width: "60%", marginBottom: "10px" }} />
        <div style={{ height: "14px", background: "#222", width: "40%" }} />
      </div>

      <style jsx>{`
        .shimmer {
          position: absolute;
          top: 0;
          left: -150%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.08),
            transparent
          );
          animation: shimmer 1.6s infinite;
        }

        @keyframes shimmer {
          100% {
            left: 150%;
          }
        }
      `}</style>
    </div>
  );
}