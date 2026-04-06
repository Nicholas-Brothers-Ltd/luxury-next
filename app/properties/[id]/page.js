"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "<CORRECT PATH>";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function PropertyPage({ params }) {
  const { id } = use(params);
  const numericId = parseInt(id);

  const [property, setProperty] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [user, setUser] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [showContact, setShowContact] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();

  // 🔐 AUTH
  useEffect(() => {
    let isMounted = true;

    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted) setUser(data.session?.user || null);
    };

    getUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const userId = user?.id;

  // 🧠 FETCH PROPERTY + SIMILAR
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("id", numericId)
        .single();

      setProperty(data);

      if (userId) {
        const { data: fav } = await supabase
          .from("favorites")
          .select("*")
          .eq("property_id", numericId)
          .eq("user_id", userId)
          .maybeSingle();

        if (fav) setIsFavorite(true);
      }

      // 🔥 SIMILAR PROPERTIES
      if (data) {
        const { data: similarData } = await supabase
          .from("properties")
          .select("*")
          .eq("location", data.location)
          .eq("type", data.type)
          .neq("id", data.id)
          .limit(3);

        setSimilar(similarData || []);
      }
    };

    fetchData();
  }, [numericId, userId]);

  const toggleFavorite = async () => {
    if (!userId) {
      toast.error("Please login first 🔐");
      return;
    }

    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("property_id", numericId)
        .eq("user_id", userId);

      setIsFavorite(false);
      toast("Removed from favorites 💔");
    } else {
      await supabase
        .from("favorites")
        .insert([{ property_id: numericId, user_id: userId }]);

      setIsFavorite(true);
      toast.success("Saved to favorites ❤️");
    }
  };

  const handleInquiry = async () => {
    if (!userId) {
      toast.error("Please login first 🔐");
      return;
    }

    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    const { error } = await supabase.from("inquiries").insert([
      {
        property_id: numericId,
        user_id: userId,
        message,
      },
    ]);

    if (!error) {
      toast.success("Inquiry sent 📩");
      setMessage("");
      setShowContact(false);
    }
  };

  if (!property) return <h2 style={{ padding: "2rem" }}>Loading...</h2>;

  let images = [];
  try {
    images = Array.isArray(property.images)
      ? property.images
      : JSON.parse(property.images || "[]");

    images = images.filter((img) => img && img.trim() !== "");
  } catch {
    images = [];
  }

  const nextImage = () =>
    setCurrentIndex((prev) => (prev + 1) % images.length);

  const prevImage = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );

  return (
    <main style={{ background: "#0a0a0a", color: "#fff" }}>
      {/* HERO */}
      <section style={{ position: "relative", height: "75vh" }}>
        <img
          src={images[currentIndex] || property.image}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(10px)",
            transition: "0.3s",
          }}
          onLoad={(e) => (e.target.style.filter = "blur(0px)")}
          onClick={() => setShowGallery(true)}
        />

        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)"
        }} />

        <div style={{ position: "absolute", bottom: "2rem", left: "2rem" }}>
          <h1>{property.title}</h1>
          <p>{property.location}</p>
          <p style={{ color: "#d4af37" }}>
            ${property.price?.toLocaleString()}
          </p>
        </div>
      </section>

      {/* DETAILS */}
      <section style={{ padding: "2rem" }}>
        <p>{property.description}</p>
      </section>

      {/* 🔥 SIMILAR PROPERTIES */}
      {similar.length > 0 && (
        <section style={{ padding: "2rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>
            Similar Properties
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
            gap: "1rem"
          }}>
            {similar.map((p) => (
              <div
                key={p.id}
                onClick={() => router.push(`/properties/${p.id}`)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={p.image}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "10px"
                  }}
                />
                <p>{p.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}