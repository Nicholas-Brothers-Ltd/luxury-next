"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section
      style={{
        position: "relative",
        height: "92vh",

        // 🔥 FULL WIDTH BREAKOUT
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",

        overflow: "hidden",
        backgroundImage:
          "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c')",
        backgroundSize: "cover",
        backgroundPosition: "center",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        color: "#fff",
        textAlign: "center",
      }}
    >
      {/* 🌑 MAIN OVERLAY */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.9))",
        }}
      />

      {/* ✨ BOTTOM BLEND */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "140px",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0), #0a0a0a)",
        }}
      />

      {/* 🎬 ANIMATED CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "900px",
          padding: "0 1rem",
          marginTop: "-40px", // 🔥 slight lift for balance
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2.3rem, 5vw, 4rem)",
            fontFamily: "Playfair Display, serif",
            marginBottom: "1rem",
            lineHeight: "1.2",
            letterSpacing: "0.5px",
          }}
        >
          Discover Exceptional Living
        </h1>

        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.3rem)",
            opacity: 0.9,
            marginBottom: "1.8rem",
          }}
        >
          Curated luxury properties in the world’s most desirable locations
        </p>

        <button
          style={{
            padding: "1rem 2.6rem",
            background: "#fff",
            color: "#000",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.06)";
            e.target.style.boxShadow = "0 12px 35px rgba(0,0,0,0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "none";
          }}
        >
          Explore Properties
        </button>
      </motion.div>
    </section>
  );
}