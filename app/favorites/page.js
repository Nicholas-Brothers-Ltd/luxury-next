"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const supabase = createClient(); // ✅ THIS WAS MISSING

export default function FavoritesPage() {

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const router = useRouter();

  // 🔐 STEP 1: CHECK AUTH
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/auth");
      } else {
        setUser(data.user);
      }
    };

    checkUser();
  }, [router]);

  // ❤️ STEP 2: FETCH FAVORITES
  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("favorites")
        .select(`
          id,
          property_id,
          properties (*)
        `)
        .eq("user_id", user.id);

      if (!error && data) {
        const properties = data.map(item => item.properties);
        setFavorites(properties);
      }

      setLoading(false);
    };

    fetchFavorites();
  }, [user]);

  function formatPrice(price) {
    return new Intl.NumberFormat().format(price);
  }

  if (!user) {
    return (
      <main style={{ padding: "3rem" }}>
        <p>Checking authentication...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "3rem", maxWidth: "1200px", margin: "auto" }}>

      <h1 style={{
        fontSize: "2rem",
        marginBottom: "2rem",
        fontFamily: "Playfair Display, serif"
      }}>
        Your Saved Properties ❤️
      </h1>

      {loading ? (
        <p>Loading favorites...</p>
      ) : favorites.length === 0 ? (
        <p>No saved properties yet.</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem"
        }}>
          {favorites.map((p) => (
            <div
              key={p.id}
              style={{
                background: "#fff",
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
            >

              <div style={{ overflow: "hidden" }}>
                <Image
                  src={p.image}
                  alt={p.title}
                  width={400}
                  height={250}
                  style={{
                    width: "100%",
                    height: "250px",
                    objectFit: "cover"
                  }}
                />
              </div>

              <div style={{ padding: "1rem" }}>
                <h2>{p.title}</h2>

                <p style={{ color: "#666" }}>
                  {p.location}
                </p>

                <p style={{ fontWeight: "bold" }}>
                  ${formatPrice(p.price)}
                </p>

                <Link href={`/properties/${p.id}`}>
                  View Property →
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </main>
  );
}