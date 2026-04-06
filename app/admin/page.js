"use client";

import { useEffect, useState } from "react";
import { createClient } from "<CORRECT PATH>";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminPage() {
  const supabase = createClient();
  const router = useRouter();

  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("buy");

  const [galleryUrls, setGalleryUrls] = useState([]);

  // 🔥 CLOUDINARY
  const uploadToCloudinary = async (file) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    return data.secure_url;
  };

  // 🔐 SIMPLE AUTH (ONLY CHECK IF LOGGED IN)
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Please login first 🔐");
        router.push("/auth");
        return;
      }

      setUser(session.user);
    };

    checkUser();
  }, [router, supabase]);

  // 🧠 FETCH DATA
  const fetchAll = async () => {
    setLoading(true);

    const { data: propertiesData } = await supabase
      .from("properties")
      .select("*")
      .order("id", { ascending: false });

    const { data: inquiriesData } = await supabase
      .from("inquiries")
      .select(`
        id,
        message,
        properties(title, location)
      `);

    setProperties(propertiesData || []);
    setInquiries(inquiriesData || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const deleteProperty = async (id) => {
    if (!confirm("Delete this property?")) return;

    await supabase.from("properties").delete().eq("id", id);
    toast.success("Deleted 🗑");
    fetchAll();
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setTitle(p.title);
    setLocation(p.location);
    setPrice(p.price);
    setImage(p.image);
    setDescription(p.description);
    setCategory(p.type);
    setGalleryUrls(p.images || []);
  };

  const handleGalleryUpload = async (files) => {
    toast.loading("Uploading...");
    const uploads = await Promise.all(
      Array.from(files).map((f) => uploadToCloudinary(f))
    );
    toast.dismiss();
    toast.success("Uploaded ✅");
    setGalleryUrls(uploads);
  };

  const addProperty = async () => {
    const cleanPrice = Number(price.toString().replace(/,/g, ""));
    await supabase.from("properties").insert([{
      title,
      location,
      price: cleanPrice,
      image,
      description,
      type: category,
      images: galleryUrls
    }]);
    toast.success("Added 🏡");
    resetForm();
    fetchAll();
  };

  const updateProperty = async () => {
    const cleanPrice = Number(price.toString().replace(/,/g, ""));
    await supabase.from("properties").update({
      title,
      location,
      price: cleanPrice,
      image,
      description,
      type: category,
      images: galleryUrls
    }).eq("id", editingId);

    toast.success("Updated ✨");
    setEditingId(null);
    resetForm();
    fetchAll();
  };

  const resetForm = () => {
    setTitle("");
    setLocation("");
    setPrice("");
    setImage("");
    setDescription("");
    setCategory("buy");
    setGalleryUrls([]);
  };

  if (!user) return <main style={{ padding: "3rem" }}>Checking...</main>;

  return (
    <main style={{ padding: "3rem", maxWidth: "1200px", margin: "auto", color: "#fff" }}>

      <h1 style={{ marginBottom: "2rem" }}>Admin Dashboard 🧠</h1>

      {/* 🏡 PROPERTY FORM */}
      <div style={{ marginBottom: "3rem" }}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />

        <input type="file" onChange={async (e) => {
          const url = await uploadToCloudinary(e.target.files[0]);
          setImage(url);
        }} />

        <input type="file" multiple onChange={(e) => handleGalleryUpload(e.target.files)} />

        <div style={{ display: "flex", gap: 10 }}>
          {galleryUrls.map((img, i) => (
            <img key={i} src={img} width="70" />
          ))}
        </div>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="buy">Buy</option>
          <option value="rent">Rent</option>
        </select>

        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

        {editingId ? (
          <button onClick={updateProperty}>Update</button>
        ) : (
          <button onClick={addProperty}>Add</button>
        )}
      </div>

      {/* 🏡 PROPERTIES */}
      <h2>Properties</h2>
      {properties.map((p) => (
        <div key={p.id} style={card}>
          <p>{p.title}</p>
          <p>{p.location}</p>
          <button onClick={() => startEdit(p)}>Edit</button>
          <button onClick={() => deleteProperty(p.id)}>Delete</button>
        </div>
      ))}

      {/* 📩 INQUIRIES */}
      <h2 style={{ marginTop: "3rem" }}>Inquiries 📩</h2>
      {inquiries.map((i) => (
        <div key={i.id} style={card}>
          <p>{i.message}</p>
          <p style={{ color: "#d4af37" }}>
            {i.properties?.title}
          </p>
        </div>
      ))}

    </main>
  );
}

const card = {
  background: "#111",
  padding: "1rem",
  marginBottom: "1rem",
  borderRadius: "10px"
};