"use client";

import { useEffect, useState } from "react";
import { MoreVertical, Plus } from "lucide-react";

type Plan = {
  id: number;
  name: string;
  price: number;
  image: string | null;
  category: string;
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("low");
  const [tab, setTab] = useState("ALL");

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // ================= FETCH =================
  const fetchPlans = async () => {
    const res = await fetch("/api/plans");
    const data = await res.json();
    setPlans(data || []);
  };

  useEffect(() => {
  const load = async () => {
    await fetchPlans();
  };

  load();
}, []);

  // ================= CLOSE MENU =================
  useEffect(() => {
    const close = () => setMenuOpen(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // ================= IMAGE =================
  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ott_upload");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dl5tzgo05/image/upload",
        { method: "POST", body: formData }
      );

      const data = await res.json();
      setImage(data.secure_url);
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ================= SAVE =================
  const savePlan = async () => {
    if (!name || !price) return;

    if (editingPlan) {
      const related = plans.filter((p) => p.name === editingPlan.name);

      await Promise.all(
        related.map((p) =>
          fetch(`/api/plans/${p.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              price: Number(price),
              image,
            }),
          })
        )
      );
    } else {
      await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          image,
          category: "ALL",
        }),
      });
    }

    resetForm();
    fetchPlans();
  };

  // ================= COPY =================
  const copyPlan = async (plan: Plan, newCategory: string) => {
    await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        basePlanId: plan.id,
        category: newCategory,
      }),
    });

    fetchPlans();
  };

  // ================= DELETE =================
  const deletePlan = async (plan: Plan) => {
    if (plan.category === "ALL") {
      alert("Cannot delete base plan");
      return;
    }

    const res = await fetch(`/api/plans/${plan.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.error || "Delete failed");
      return;
    }

    fetchPlans();
  };

  // ================= FILTER =================
  const filteredPlans = plans
    .filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((p) => {
      if (tab === "ALL") return p.category === "ALL";
      return p.category === tab;
    })
    .sort((a, b) =>
      sort === "low" ? a.price - b.price : b.price - a.price
    );

  // ================= RESET =================
  const resetForm = () => {
    setName("");
    setPrice("");
    setImage(null);
    setEditingPlan(null);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Plans</h1>

        <button
  onClick={() => setShowModal(true)}
  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2 rounded-xl shadow-md hover:scale-105 transition"
>
  <Plus size={16} />
  Add Plan
</button>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 rounded-xl border mb-4"
      />

      {/* ✅ SORT DROPDOWN (PUT HERE) */}
<div className="flex justify-end mb-3">
  <select
    value={sort}
    onChange={(e) => setSort(e.target.value)}
    className="p-2 text-sm rounded-xl border bg-white shadow"
  >
    <option value="low">Price: Low → High</option>
    <option value="high">Price: High → Low</option>
  </select>
</div>

      {/* TABS */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: "ALL", label: "All" },
          { key: "ALL_IN_ONE", label: "All-in-One" },
          { key: "SINGLE", label: "Single" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1 text-xs rounded-full ${
              tab === t.key
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                : "bg-white border"
            }`}
          >
            {t.label}
          </button>
        ))}

        {tab !== "ALL" && (
  <button
    onClick={() => setShowPicker(true)}
    className="ml-auto px-3 py-1 text-xs rounded-full bg-green-500 text-white hover:scale-105 transition"
  >
    + Add
  </button>
)}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
        {filteredPlans.map((p) => (
          <div key={p.id} className="p-[2px] rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
            <div className="bg-white p-2 md:p-3 rounded-xl relative">

              <div className="absolute right-2 top-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // ✅ FIXED MENU BUG
                    setMenuOpen(menuOpen === p.id ? null : p.id);
                  }}
                >
                  <MoreVertical size={16} />
                </button>

                {menuOpen === p.id && (
                  <div className="absolute right-0 mt-2 bg-white shadow-xl rounded-xl w-28 z-50">
                    <button
                      onClick={() => {
                        setEditingPlan(p);
                        setName(p.name);
                        setPrice(String(p.price));
                        setImage(p.image);
                        setShowModal(true);
                      }}
                      className="block w-full px-3 py-2 text-xs hover:bg-gray-100"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deletePlan(p)}
                      className="block w-full px-3 py-2 text-xs text-red-500 hover:bg-gray-100"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {p.image && (
                <img
                  src={p.image}
                  onClick={() => setPreviewImage(p.image)}
                  className="w-8 h-8 rounded-full cursor-pointer"
                />
              )}

              <h2 className="font-medium text-[11px] md:text-sm text-gray-800 leading-snug">
  {p.name}
</h2>

<p className="text-xs text-gray-400 mt-1">
  Subscription plan
</p>

<p className="text-indigo-600 font-bold text-xs md:text-base">
  ₹{p.price}
</p>
            </div>
          </div>
        ))}
      </div>

{/* PICKER */}
{showPicker && (
  <div
    className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]"
    onClick={() => setShowPicker(false)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white p-5 rounded-2xl w-[300px] shadow-xl"
    >
      <h2 className="text-sm font-semibold mb-3 text-gray-700">
        Select Plan
      </h2>

      {plans
        .filter((p) => p.category === "ALL")
        .map((p) => (
          <div
            key={p.id}
            onClick={() => {
              copyPlan(p, tab);
              setShowPicker(false);
            }}
            className="p-3 border rounded-xl mb-2 cursor-pointer hover:bg-gray-100 transition"
          >
            {p.name}
          </div>
        ))}
    </div>
  </div>
)}

      {/* MODAL */}
      {showModal && (
        <div
          onClick={resetForm}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[350px] p-[2px] rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <div className="bg-white rounded-2xl p-6">

              <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded-xl mb-3"
              />

              <input
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-3 border rounded-xl mb-3"
              />

              <label className="block bg-purple-600 text-white text-center py-2 rounded-xl cursor-pointer">
                Upload Image
                <input type="file" onChange={handleImage} className="hidden" />
              </label>

              {uploading && (
                <p className="text-xs text-center mt-2">Uploading...</p>
              )}

              {image && (
                <img src={image} className="w-20 h-20 mx-auto mt-3 rounded-xl" />
              )}

              <button
                onClick={savePlan}
                className="mt-4 w-full bg-purple-600 text-white py-2 rounded-xl"
              >
                Save
              </button>

            </div>
          </div>
        </div>
      )}

      {/* IMAGE PREVIEW */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        >
          <img src={previewImage} className="max-w-md rounded-xl" />
        </div>
      )}
    </div>
  );
}