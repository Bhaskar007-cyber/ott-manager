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
  const [category, setCategory] = useState("ALL");

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

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ott_upload");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dl5tzgo05/image/upload",
      { method: "POST", body: formData }
    );

    const data = await res.json();
    setImage(data.secure_url);
  };

  // ================= SAVE =================
  const savePlan = async () => {
    if (!name || !price) return;

    const payload = {
      name,
      price: Number(price),
      image,
      category,
    };

    let res;

    if (editingPlan) {
      res = await fetch(`/api/plans/${editingPlan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) return alert("Error saving");

    resetForm();
    fetchPlans();
  };

  // ================= COPY =================
  const copyPlan = async (plan: Plan, newCategory: string) => {
    await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: plan.name,
        price: plan.price,
        image: plan.image,
        category: newCategory,
      }),
    });

    fetchPlans();
  };

  // ================= DELETE =================
  const deletePlan = async (id: number) => {
    await fetch(`/api/plans/${id}`, { method: "DELETE" });
    fetchPlans();
  };

  // ================= FILTER =================
  const filteredPlans = plans
  .filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )
  .filter((p) => {
    if (tab === "ALL") return p.category === "ALL"; // ✅ FIX
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
    setCategory("ALL");
    setEditingPlan(null);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Plans</h1>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2 rounded-xl shadow-lg hover:scale-105 transition"
        >
          <Plus size={16} /> Add Plan
        </button>
      </div>

      {/* SEARCH + SORT */}
      <div className="flex gap-3 mb-6">
        <input
          placeholder="Search plans..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-indigo-400"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="p-3 rounded-xl border"
        >
          <option value="low">Low → High</option>
          <option value="high">High → Low</option>
        </select>
      </div>

      {/* TABS */}
      <div className="flex gap-3 mb-6">
        {[
          { key: "ALL", label: "All Plans" },
          { key: "ALL_IN_ONE", label: "All-in-One" },
          { key: "SINGLE", label: "Single Packs" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              tab === t.key
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                : "bg-white/70 backdrop-blur border"
            }`}
          >
            {t.label}
          </button>
        ))}

        {tab !== "ALL" && (
          <button
            onClick={() => setShowPicker(true)}
            className="ml-auto bg-green-500 text-white px-4 py-2 rounded-xl shadow hover:scale-105 transition"
          >
            + Add
          </button>
        )}
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-5">
        {filteredPlans.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl p-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] transition"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-5 relative">

              {/* MENU */}
              <div className="absolute right-3 top-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === p.id ? null : p.id);
                  }}
                >
                  <MoreVertical size={18} />
                </button>

                {menuOpen === p.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-2 bg-white shadow-xl rounded-xl w-32 z-10"
                  >
                    <button
                      onClick={() => {
                        setEditingPlan(p);
                        setName(p.name);
                        setPrice(String(p.price));
                        setImage(p.image);
                        setCategory(p.category);
                        setShowModal(true);
                      }}
                      className="block w-full px-3 py-2 text-left hover:bg-gray-100"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deletePlan(p.id)}
                      className="block w-full px-3 py-2 text-left text-red-500 hover:bg-gray-100"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* IMAGE */}
              {p.image && (
                <img
                  src={p.image}
                  onClick={() => setPreviewImage(p.image)}
                  className="w-12 h-12 rounded-full cursor-pointer"
                />
              )}

              <h2 className="font-semibold mt-3">{p.name}</h2>
              <p className="text-gray-500 text-sm">Subscription plan</p>
              <p className="text-lg font-bold mt-2 text-indigo-600">₹{p.price}</p>

            </div>
          </div>
        ))}
      </div>

      {/* PICKER */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[500px] max-h-[80vh] overflow-y-auto shadow-2xl">
            <h2 className="font-bold mb-4">Select Plan</h2>

            <div className="grid grid-cols-2 gap-3">
              {plans
  .filter((p) => p.category === "ALL") // 🔥 IMPORTANT FIX
  .map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    copyPlan(p, tab);
                    setShowPicker(false);
                  }}
                  className="border p-3 rounded-xl cursor-pointer hover:bg-indigo-50"
                >
                  {p.name}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPicker(false)}
              className="mt-4 bg-gray-200 px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-2xl w-[350px]">

            <input
              placeholder="Plan Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 w-full mb-3 rounded"
            />

            <input
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border p-2 w-full mb-3 rounded"
            />

            <label className="bg-gray-200 px-3 py-2 rounded cursor-pointer block text-center">
              Choose Image
              <input type="file" onChange={handleImage} className="hidden" />
            </label>

            <div className="flex gap-3 mt-4">
              <button
                onClick={savePlan}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>

              <button
                onClick={resetForm}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
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