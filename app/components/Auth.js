"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase";
import { useRouter } from "next/navigation";

const supabase = createClient(); // ✅ FIX

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");

  const router = useRouter();

  const handleAuth = async () => {
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Logged in successfully 🎉");
        router.push("/admin"); // ✅ SIMPLE FLOW (as you wanted)
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Check your email to confirm 📩");
      }
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "2rem" }}>
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
      />

      <button onClick={handleAuth}>
        {isLogin ? "Login" : "Sign Up"}
      </button>

      <p
        onClick={() => setIsLogin(!isLogin)}
        style={{ cursor: "pointer", marginTop: "1rem" }}
      >
        {isLogin ? "Create account" : "Already have an account?"}
      </p>

      {message && <p>{message}</p>}
    </div>
  );
}