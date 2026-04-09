"use client";

import { useState, useMemo } from "react";
import { createClient } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        console.log("LOGIN DATA:", data);
        console.log("LOGIN ERROR:", error);

        if (error) throw error;

        setMessage("Login successful 🎉");
        router.push("/admin");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        console.log("SIGNUP DATA:", data);
        console.log("SIGNUP ERROR:", error);

        if (error) throw error;

        if (!data?.user) {
          throw new Error("Signup failed: No user returned");
        }

        setMessage("Signup successful. Check your email 📩");
      }
    } catch (err) {
      console.error("AUTH ERROR:", err);
      setMessage(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={handleChange}
            className="w-full p-3 rounded bg-zinc-800"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
            className="w-full p-3 rounded bg-zinc-800"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded font-semibold"
          >
            {loading
              ? "Processing..."
              : isLogin
              ? "Login"
              : "Sign Up"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-zinc-400">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm">
          {isLogin ? "No account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}