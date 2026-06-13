"use client";

import { useEffect, useState } from "react";
import { MoreVertical, Plus } from "lucide-react";
import { Search } from "lucide-react";
import { Bell } from "lucide-react";

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
  try {
    // 🔥 If base plan → delete all related copies
    if (plan.category === "ALL") {
      const related = plans.filter((p) => p.name === plan.name);

      await Promise.all(
        related.map((p) =>
          fetch(`/api/plans/${p.id}`, {
            method: "DELETE",
          })
        )
      );
    } else {
      // normal delete
      await fetch(`/api/plans/${plan.id}`, {
        method: "DELETE",
      });
    }

    fetchPlans();
  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
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
    <div className="min-h-screen p-4 md:p-6 bg-[#f5f7fb]">

      {/* HEADER */}
     <div className="flex justify-between items-center mb-5">

  <h1 className="text-2xl font-bold">
    Plans
  </h1>

  <div className="relative">

    <Bell size={24} />

    <span
      className="
      absolute
      -top-1
      -right-1
      w-4
      h-4
      rounded-full
      bg-red-500
      text-white
      text-[10px]
      flex
      items-center
      justify-center
      "
    >
      1
    </span>

  </div>

</div>

      {/* SEARCH */}
    <div className="flex items-center gap-3 mb-5">

  <div className="relative flex-1">

    <Search
      size={18}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
    />

    <input
      placeholder="Search plans..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="
      w-full
      pl-11
      h-12
      rounded-2xl
      border
      border-gray-200
      bg-white
      "
    />

  </div>

  <button
    onClick={() => setShowModal(true)}
  className="
  whitespace-nowrap
  px-4
  h-10
  rounded-2xl
  bg-gradient-to-r
  from-purple-600
  to-indigo-600
  text-white
  font-medium
  shadow-lg
  "

  >
    + Add Plan
  </button>

</div>
      

      {/* TABS */}
<div className="flex justify-between items-center mb-5">

  <div className="flex gap-2">
    {[
      { key: "ALL", label: "All" },
      { key: "ALL_IN_ONE", label: "All-in-One" },
      { key: "SINGLE", label: "Single" },
    ].map((t) => (
      <button
        key={t.key}
        onClick={() => setTab(t.key)}
        className={`px-2 h-10 rounded-full text-sm ${
          tab === t.key
            ? "bg-purple-600 text-white"
            : "bg-white border border-gray-200"
        }`}
      >
        {t.label}
      </button>
    ))}
  </div>

  <select
    value={sort}
    onChange={(e) => setSort(e.target.value)}
    className="h-10 px-1 rounded-xl border border-gray-300 bg-white"
  >
    <option value="low">Low → High</option>
    <option value="high">High → Low</option>
  </select>

</div>

      {/* GRID */}
      <div className="space-y-3">
        {filteredPlans.map((p) => (
          <div key={p.id} 
className="
bg-white
rounded-[28px]
p-4
shadow-sm
border
border-slate-100
hover:shadow-md
transition
">
            <div className="relative">

              

              <div className="flex items-center gap-3">

  {p.image && (
    <img
      src={p.image}
      onClick={() => setPreviewImage(p.image)}
      className="
      w-12 h-12
      rounded-2xl
      object-cover
      cursor-pointer
      border
      border-gray-200
      "
    />
  )}

  <div className="flex-1">

    <h2 className="font-bold text-[10px] text-gray-900">
      {p.name}
    </h2>

    <p className="text-sm text-gray-500">
      Subscription plan
    </p>

    <p className="text-indigo-600 text-[11px] font-semibold mt-1">
  ₹{p.price}
</p>

  </div>

  <div className="flex flex-col items-end gap-2">
    <div className="relative">
  <button
    onClick={(e) => {
      e.stopPropagation();
      setMenuOpen(menuOpen === p.id ? null : p.id);
    }}
  >
    <MoreVertical
      size={18}
      className="text-gray-900"
    />
  </button>

  {menuOpen === p.id && (
  <div
  className="
  absolute
  right-0
  top-8
  w-36
  bg-white/95
  backdrop-blur-md
  rounded-2xl
  shadow-[0_10px_40px_rgba(0,0,0,0.12)]
  border
  border-gray-100
  overflow-hidden
  z-50
  "
>

    <button
      onClick={() => {
        setEditingPlan(p);
        setName(p.name);
        setPrice(String(p.price));
        setImage(p.image);
        setShowModal(true);
      }}
      className="block w-full px-3 py-2 text-sm hover:bg-gray-100"
    >
      Edit
    </button>

    <button
      onClick={() => deletePlan(p)}
      className="block w-full px-3 py-2 text-sm text-red-500 hover:bg-gray-100"
    >
      Delete
    </button>

  </div>
)}
</div>
    
  </div>
  </div>

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
    className="
    fixed inset-0
    bg-black/40
    backdrop-blur-sm
    flex items-center justify-center
    z-50
    px-4
    "
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="
      w-full
      max-w-md
      bg-white
      rounded-3xl
      shadow-2xl
      overflow-hidden
      "
    >
      
{/* Header */}
<div className="flex items-center justify-between px-6 pt-5 pb-2">
  <div>
    <h2 className="text-2xl font-bold text-gray-900">
      {editingPlan ? "Edit Plan" : "Add Plan"}
    </h2>
  </div>

  <button
    onClick={resetForm}
    className="
    w-9 h-9
    rounded-full
    bg-gray-100
    hover:bg-gray-200
    transition
    flex items-center justify-center
    text-gray-500
    "
  >
    ✕
  </button>
</div>

      {/* Body */}
      <div className="p-6">

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Plan Name
        </label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter plan name"
          className="w-full h-12 px-4 border border-gray-200 rounded-xl mb-4"
        />

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price (₹)
        </label>

        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Enter price"
          className="w-full h-12 px-4 border border-gray-200 rounded-xl mb-4"
        />

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Plan Image
        </label>

        <label
          className="
          flex items-center gap-4
          border-2 border-dashed border-gray-300
          rounded-2xl
          p-5
          cursor-pointer
          hover:bg-gray-50
          "
        >
          <input
            type="file"
            onChange={handleImage}
            className="hidden"
          />

          <div className="text-2xl">📤</div>

          <div>
            <p className="font-medium text-sm">
              Upload Image
            </p>

            <p className="text-xs text-gray-500">
              PNG, JPG up to 2MB
            </p>
          </div>
        </label>

        {image && (
          <img
            src={image}
            className="w-24 h-24 object-cover rounded-xl mt-4"
          />
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-6">

          <button
            onClick={resetForm}
            className="
            flex-1
            h-11
            rounded-xl
            border
            border-gray-300
            "
          >
            Cancel
          </button>

          <button
            onClick={savePlan}
            className="
            flex-1
            h-11
            rounded-xl
            bg-gradient-to-r
            from-purple-600
            to-indigo-600
            text-white
            font-medium
            "
          >
            Save Plan
          </button>

        </div>
      </div>
    </div>
  </div>
)}

      {/* IMAGE PREVIEW */}
{previewImage && (
  <div
    onClick={() => setPreviewImage(null)}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-2xl p-4 max-w-sm w-full max-h-[80vh] overflow-auto shadow-xl"
    >
      <img
        src={previewImage}
        className="w-full h-auto rounded-xl object-contain"
      />
    </div>
  </div>
)}
    </div>
  );
}