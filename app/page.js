\"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "<CORRECT PATH>";
import { useRouter } from "next/navigation";
import Hero from "./components/Hero";
import PropertyCardSkeleton from "./components/PropertyCardSkeleton";
import { motion } from "framer-motion";

const supabase = createClient(); // ✅ NOW CORRECTLY PLACED

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

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

  const featured = properties.slice(0, 6);
  const buy = properties.filter((p) => p.type === "buy").slice(0, 6);
  const rent = properties.filter((p) => p.type === "rent").slice(0, 6);
  const luxury = properties.filter((p) => p.price > 1000000).slice(0, 6);

  return (
    <>
      <Hero />

      <div style={{ background: "#0a0a0a", padding: "80px 20px" }}>

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

        <Section title="Featured Properties">
          {loading ? skeletons() : render(featured)}
        </Section>

        <Section title="Homes for Sale">
          {loading ? skeletons() : render(buy)}
        </Section>

        <Section title="Rental Properties">
          {loading ? skeletons() : render(rent)}
        </Section>

        <Section title="Luxury Collection">
          {loading ? skeletons() : render(luxury)}
        </Section>

        <div ref={resultsRef}>
          <Section title="Search Results">
            {loading ? skeletons() : render(filtered)}
          </Section>
        </div>

      </div>
    </>
  );

  function Section({ title, children }) {
    return (
      <motion.div style={{ maxWidth: "1400px", margin: "0 auto 60px" }}>
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
        onClick={() => router.push(`/properties/${p.id}`)}
      >
        <img src={p.image} style={img} />
        <div style={{ padding: 16 }}>
          <h3>{p.title}</h3>
          <p>{p.location}</p>
          <p>${p.price?.toLocaleString()}</p>
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

const filterBox = { display: "flex", gap: 10, flexWrap: "wrap" };
const input = { padding: 10 };
const titleStyle = { color: "#fff", fontSize: 28 };
const grid = { display: "grid", gap: 20 };
const card = { background: "#111", borderRadius: 16 };
const img = { width: "100%", height: 200, objectFit: "cover" };