"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Hero from "./components/Hero";
import PropertyCardSkeleton from "./components/PropertyCardSkeleton";
import { motion } from "framer-motion";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // 🔍 FILTERS
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");

  const resultsRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    fetchProperties();
    fetchFavorites();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    const { data } = await supabase.from("properties").select("*");
    if (data) setProperties(data);
    setLoading(false);
  };

  const fetchFavorites = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return;

    const { data } = await supabase
      .from("favorites")
      .select("property_id")
      .eq("user_id", user.id);

    setFavorites(data?.map((f) => f.property_id) || []);
  };

  const toggleFavorite = async (id) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) return router.push("/auth");

    if (favorites.includes(id)) {
      await supabase.from("favorites").delete().eq("property_id", id);
      setFavorites(favorites.filter((f) => f !== id));
    } else {
      await supabase
        .from("favorites")
        .insert([{ property_id: id, user_id: user.id }]);
      setFavorites([...favorites, id]);
    }
  };

  // 🧠 AUTO SCROLL TO RESULTS
  useEffect(() => {
    if (
      search ||
      typeFilter ||
      minPrice ||
      maxPrice ||
      bedrooms ||
      bathrooms
    ) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 200);
    }
  }, [search, typeFilter, minPrice, maxPrice, bedrooms, bathrooms]);

  // 🎯 FILTERED LIST
  const filtered = properties.filter((p) => {
    return (
      (p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase())) &&
      (!typeFilter || p.type === typeFilter) &&
      (!minPrice || p.price >= minPrice) &&
      (!maxPrice || p.price <= maxPrice) &&
      (!bedrooms || p.bedrooms >= bedrooms) &&
      (!bathrooms || p.bathrooms >= bathrooms)
    );
  });

  // 📦 SECTIONS
  const featured = properties.slice(0, 6);
  const buy = properties.filter((p) => p.type === "buy").slice(0, 6);
  const rent = properties.filter((p) => p.type === "rent").slice(0, 6);
  const luxury = properties.filter((p) => p.price > 1000000).slice(0, 6);

  return (
    <>
      <Hero />

      <div style={{ background: "#0a0a0a", padding: "80px 20px" }}>

        {/* 🔍 STICKY FILTER PANEL */}
        <div id="search" style={filterBox}>
          <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} style={input} />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={input}>
            <option value="">All</option>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
          </select>
          <input placeholder="Min Price" type="number" onChange={(e) => setMinPrice(e.target.value)} style={input} />
          <input placeholder="Max Price" type="number" onChange={(e) => setMaxPrice(e.target.value)} style={input} />
          <input placeholder="Beds" type="number" onChange={(e) => setBedrooms(e.target.value)} style={input} />
          <input placeholder="Baths" type="number" onChange={(e) => setBathrooms(e.target.value)} style={input} />
        </div>

        <Section id="featured" title="Featured Properties">
          {loading ? skeletons() : render(featured)}
        </Section>

        <Section id="buy" title="Homes for Sale">
          {loading ? skeletons() : render(buy)}
        </Section>

        <Section id="rent" title="Rental Properties">
          {loading ? skeletons() : render(rent)}
        </Section>

        <Section id="luxury" title="Luxury Collection">
          {loading ? skeletons() : render(luxury)}
        </Section>

        <div ref={resultsRef}>
          <Section id="results" title="Search Results">
            {loading ? skeletons() : render(filtered)}
          </Section>
        </div>

      </div>

      <style>{`
        html {
          scroll-behavior: smooth;
        }

        .property-card:hover .property-img {
          transform: scale(1.1);
        }
      `}</style>
    </>
  );

  // 🔥 ANIMATED SECTION
  function Section({ id, title, children }) {
    return (
      <motion.div
        id={id}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: "1400px",
          margin: "0 auto 60px",
          scrollMarginTop: "100px",
        }}
      >
        <h2 style={titleStyle}>{title}</h2>
        <div style={grid}>{children}</div>
      </motion.div>
    );
  }

  function render(list) {
    return list.map((p) => (
      <motion.div
        key={p.id}
        whileHover={{ y: -10 }}
        style={card}
        className="property-card"
        onClick={() => router.push(`/properties/${p.id}`)}
      >
        <div style={{ overflow: "hidden" }}>
          <img src={p.image} className="property-img" style={img} />
        </div>

        <div style={{ padding: 16, color: "#fff" }}>
          <h3>{p.title}</h3>
          <p>{p.location}</p>
          <p style={{ color: "#d4af37" }}>
            ${p.price?.toLocaleString()}
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(p.id);
            }}
          >
            {favorites.includes(p.id) ? "Saved" : "Save"}
          </button>
        </div>
      </motion.div>
    ));
  }

  function skeletons() {
    return [...Array(6)].map((_, i) => (
      <PropertyCardSkeleton key={i} />
    ));
  }
}

// 🎨 STYLES (UPGRADED)
const filterBox = {
  position: "sticky",
  top: "80px",
  zIndex: 50,
  maxWidth: "1400px",
  margin: "0 auto 40px",
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  padding: "12px",
  borderRadius: "12px",
  background: "rgba(0,0,0,0.85)",
  backdropFilter: "blur(10px)",
};

const input = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #333",
  background: "#000",
  color: "#fff",
};

const titleStyle = {
  color: "#fff",
  fontSize: 28,
  marginBottom: 20,
  fontFamily: "Playfair Display, serif",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  gap: 20,
};

const card = {
  background: "#111",
  borderRadius: 16,
  overflow: "hidden",
  cursor: "pointer",
};

const img = {
  width: "100%",
  height: 200,
  objectFit: "cover",
  transition: "0.5s",
};