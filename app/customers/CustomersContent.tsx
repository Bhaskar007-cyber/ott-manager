"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Pencil,
  RefreshCcw,
  Trash2,
} from "lucide-react";

type Customer = {
  id: number;
  name: string;
  phone: string;
  planId: number;
  expiryDate: string;
  startDate?: string;
  ottNumber?: string;

  plan?: {
  image?: string | null;
};
};

type Plan = {
  id: number;
  name: string;
};

export default function CustomersContent() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [planId, setPlanId] = useState("");
  const [ottNumber, setOttNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      const data = await res.json();

      setCustomers(data.customers || []);
      setPlans(data.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const load = async () => {
    await fetchData();
  };

  load();
}, []);

  // ================= FILTER =================
  const filteredCustomers = customers.filter((c) => {
  const expired = new Date(c.expiryDate) < new Date();

  // 🔍 SEARCH FILTER
 const searchValue = search.toLowerCase();

const matchesSearch =
  c.name.toLowerCase().includes(searchValue) ||
  String(c.phone).includes(searchValue) ||
  String(c.ottNumber).includes(searchValue);

  // 🎯 STATUS FILTER
  if (status === "active") return !expired && matchesSearch;
  if (status === "expired") return expired && matchesSearch;

  return matchesSearch;
});

  // ================= UNIQUE PLANS =================
  const uniquePlans = Array.from(
    new Map(plans.map((p) => [p.name, p])).values()
  );

  // ================= SAVE =================
  const saveCustomer = async () => {
    if (!name || !phone || !planId || !ottNumber) {
      alert("All fields required");
      return;
    }

    const payload = {
      name,
      phone,
      planId: Number(planId),
      ottNumber,
      startDate,
    };

    let res;

    if (editingId) {
      res = await fetch(`/api/customers/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErrorMsg(data?.error || "Something went wrong");
      return;
    }

    setErrorMsg("");
    resetForm();
    fetchData();
  };

  // ================= DELETE =================
  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/customers/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setDeleteId(null);
      fetchData();
    } catch {
      alert("Delete failed");
    }
  };

  // ================= RESET =================
  const resetForm = () => {
    setName("");
    setPhone("");
    setPlanId("");
    setOttNumber("");
    setStartDate("");
    setEditingId(null);
    setShowModal(false);
  };

  // ================= EDIT =================
  const editCustomer = (c: Customer) => {
    setName(c.name);
    setPhone(c.phone);
    setPlanId(String(c.planId));
    setOttNumber(c.ottNumber || "");
    setStartDate(c.startDate?.split("T")[0] || "");
    setEditingId(c.id);
    setShowModal(true);
  };

  // ================= RENEW =================
  const renewCustomer = async (id: number) => {
    try {
      const res = await fetch(`/api/customers/${id}/renew`, {
        method: "PUT",
      });

      if (!res.ok) throw new Error();

      fetchData();
    } catch {
      alert("Renew failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
  <div
 className="
min-h-screen
relative
overflow-hidden
px-2 py-3
bg-[#f3f1fb]
"
>
 
      <div className="max-w-md mx-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-5 items-center">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800">
            Customers
          </h1>

          
        </div>

       {/* ✅ PUT SEARCH HERE */}
<div className="flex items-center gap-3 mb-6">

  <div className="relative flex-1">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
      🔍
    </span>

    <input
      placeholder="🔍 Search customers..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="
      w-full
      h-12
      pl-11
      pr-4
      rounded-full
      bg-white/35
backdrop-blur-2xl
border-white/60
shadow-[0_8px_25px_rgba(180,180,220,.12)]
      backdrop-blur-xl
      border
      border-white/70
      outline-none
      shadow-sm
      "
    />
  </div>

  <button
    onClick={() => setShowModal(true)}
    className="
    h-10
    w-20
    text-[11px]
    rounded-full
    bg-gradient-to-r
    from-violet-500
    to-indigo-500
    text-white
    shadow-[0_15px_40px_rgba(139,92,246,.55)]
    "
  >
    + Add
  </button>

</div>

        {/* LIST */}
        <div className="space-y-4">
          {filteredCustomers.map((c) => {
            const expired = new Date(c.expiryDate) < new Date();

            return (
<div
  key={c.id}
className="
relative
overflow-hidden
bg-white/20
backdrop-blur-[40px]
rounded-[24px]
p-2
border
border-white/60
shadow-[0_20px_60px_rgba(31,38,135,0.15)]
"
>
  <div
  className="
  absolute
  top-0
  left-0
  w-full
  h-20
  bg-gradient-to-b
  from-white/70
  to-transparent
  pointer-events-none
  "
/>

{/* PURPLE GLOW */}
<div
  className="
  absolute
  -left-10
  top-0
  w-32
  h-32
  bg-violet-300/20
  blur-3xl
  rounded-full
  "
/>

{/* GLASS OVERLAY */}
<div
  className="
  absolute
  inset-0
  rounded-[35px]
  bg-gradient-to-br
  from-white/70
  via-white/20
  to-white/5
  pointer-events-none
  "
/>
  {/* TOP */}
  <div className="relative z-10 flex justify-between items-start">

  <div className="flex items-start gap-4 flex-1">

    {/* Avatar */}
    <div
      className="
      w-12
      h-12
      rounded-full
      bg-gradient-to-br
      from-white
      to-violet-50
      shadow-[0_0_40px_rgba(139,92,246,.35)]
      flex
      items-center
      justify-center
      text-violet-500
      font-semibold
      text-base
      shrink-0
      "
    >
      {c.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")}
    </div>

    {/* Text */}
    <div className="flex flex-col min-w-0">

  <h2 className="text-xs font-semibold text-slate-900">
    {c.name}
  </h2>

  <p className="text-[11px] text-slate-500 ">
    {c.phone}
  </p>

  <p className="text-[11px] text-violet-600 font-medium">
    OTT: {c.ottNumber || "-"}
  </p>

  <p className="text-[11px] text-slate-400">
    Exp: {new Date(c.expiryDate).toLocaleDateString()}
  </p>

</div>

  </div>

  {/* Right Side */}
  <div className="flex flex-col items-end gap-3">

    <span
      className={`px-3 py-1 text-xs rounded-full text-sm font-medium ${
        expired
          ? "bg-red-100/60 text-red-500 backdrop-blur-xl"
          : "bg-green-100/60 text-green-500 backdrop-blur-xl"
      }`}
    >
      {expired ? "Expired" : "Active"}
    </span>

    {c.plan?.image && (
      <img
        src={c.plan.image}
        alt="plan"
        onClick={() => setPreviewImage(c.plan?.image || null)}
        className="
        w-10
        h-10
        rounded-2xl
        object-cover
        cursor-pointer
        "
      />
    )}

  </div>

</div>
  {/* BUTTONS */}
  <div className="relative z-10 flex items-center justify-center gap-3 mt-2">

    <button
  onClick={() => editCustomer(c)}
  className="
  w-[80px]
  h-8
gap-1
text-[10px]
  rounded-full
  bg-white/40
  backdrop-blur-xl
  border
  border-white/60
  flex
  items-center
  justify-center

  text-indigo-500
  font-medium
  "
>
  <Pencil size={9.5} />
  Edit
</button>
    <button
  onClick={() => renewCustomer(c.id)}
  className="
  w-[80px]
  h-8
gap-1
text-[10px]
  rounded-full
  bg-white/40
  backdrop-blur-xl
  border
  border-white/60
  flex
  items-center
  justify-center
  
  text-violet-600
  font-medium
  "
>
  <RefreshCcw size={9.5} />
  Renew
</button>

    <button
  onClick={() => setDeleteId(c.id)}
  className="
   w-[80px]
  h-8
gap-1
text-[10px]
  rounded-full
  bg-white/40
  backdrop-blur-xl
  border
  border-white/60
  flex
  items-center
  justify-center
  text-red-500
  font-medium
  "
>
  <Trash2 size={9.5} />
  Delete
</button>
  </div>
</div>
            );
          })}
        </div>

      </div>

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center">
            <p className="mb-4">Delete this customer?</p>
            <div className="flex gap-2">
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Yes
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
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
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border rounded-xl mb-3"
              />

              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full p-3 border rounded-xl mb-3"
              >
                <option value="">Select Plan</option>
                {uniquePlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <input
                placeholder="OTT Number"
                value={ottNumber}
                onChange={(e) => setOttNumber(e.target.value)}
                className="w-full p-3 border rounded-xl mb-3"
              />

              <input
  type="date"
  value={startDate}
  onChange={(e) => setStartDate(e.target.value)}
  className="w-full p-3 border rounded-xl mb-3"
/>

              <button
                onClick={saveCustomer}
                className="w-full bg-purple-600 text-white py-2 rounded-xl"
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
    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white p-3 rounded-2xl shadow-xl"
    >
      <img
        src={previewImage}
        alt="preview"
        className="w-64 rounded-xl object-cover"
      />
    </div>
  </div>
)}
    </div>
  );
}