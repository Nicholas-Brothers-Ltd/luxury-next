"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase";
import toast from "react-hot-toast";

const supabase = createClient(); // ✅ FIX

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("");

  // 🔐 AUTH
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted) setUser(data.session?.user || null);
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // 🚪 LOGOUT
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast("Logged out successfully 👋");
  };

  // 🎯 SCROLL EFFECT
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🧭 SCROLL SPY
  useEffect(() => {
    const sections = ["featured", "buy", "rent", "luxury", "results"];

    const handleScroll = () => {
      let current = "";

      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop - 120;
          if (window.scrollY >= top) {
            current = id;
          }
        }
      });

      setActive(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatEmail = (email) => {
    if (!email) return "";
    return email.length > 18 ? email.slice(0, 15) + "..." : email;
  };

  const linkStyle = (isActive) => ({
    color: isActive ? "#d4af37" : "#fff",
    transition: "0.3s ease",
    textDecoration: "none",
  });

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 1000,
        background: scrolled
          ? "rgba(10,10,10,0.85)"
          : "rgba(0,0,0,0.4)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(255,255,255,0.05)",
        transition: "all 0.3s ease",
        padding: scrolled ? "0.8rem 2rem" : "1.2rem 2rem",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link href="/" style={{ color: "#fff", textDecoration: "none" }}>
          Nicholas Experience
        </Link>

        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <Link href="#featured" style={linkStyle(active === "featured")}>Home</Link>
          <Link href="#buy" style={linkStyle(active === "buy")}>Buy</Link>
          <Link href="#rent" style={linkStyle(active === "rent")}>Rent</Link>
          <Link href="#luxury" style={linkStyle(active === "luxury")}>Luxury</Link>
          <Link href="/favorites" style={{ color: "#fff" }}>Favorites</Link>

          {user ? (
            <>
              <span style={{ opacity: 0.7 }}>
                {formatEmail(user.email)}
              </span>

              <button onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}