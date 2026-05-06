"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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
    <div className="min-h-screen p-3 md:p-6 bg-[#f5f7fb]">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-5 items-center">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800">
            Customers
          </h1>

          
        </div>

       {/* ✅ PUT SEARCH HERE */}
<div className="flex items-center gap-2 mb-4">
  <input
    placeholder="Search customer..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="flex-[0.7] min-w-0 p-3 rounded-xl border"
  />

  <button
    onClick={() => setShowModal(true)}
    className="flex-shrink-0 whitespace-nowrap bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-2 rounded-xl shadow-md"
  >
    + Add Customer
  </button>
</div>

        {/* LIST */}
        <div className="space-y-4">
          {filteredCustomers.map((c) => {
            const expired = new Date(c.expiryDate) < new Date();

            return (
              <div
  key={c.id}
  className="bg-white rounded-xl p-4 shadow-md border border-gray-100 transition-all active:scale-[0.98]"
>
  {/* TOP */}
  <div className="flex justify-between items-start gap-3">

    {/* LEFT INFO */}
    <div className="flex-1 min-w-0">

      <h2 className="text-sm font-semibold text-gray-800 leading-tight break-words">
        {c.name}
      </h2>

      <p className="text-xs text-gray-500 mt-1">
        {c.phone}
      </p>

      <p className="text-xs text-indigo-600 mt-1">
        OTT: {c.ottNumber || "-"}
      </p>

      <p className="text-[11px] text-gray-400 mt-1">
        Exp: {new Date(c.expiryDate).toLocaleDateString()}
      </p>
    </div>

    <div className="flex flex-col items-end gap-2 shrink-0">

  {/* STATUS */}
  <span
    className={`text-[10px] px-2 py-1 rounded-full font-medium ${
      expired
        ? "bg-red-100 text-red-600"
        : "bg-green-100 text-green-600"
    }`}
  >
    {expired ? "Expired" : "Active"}
  </span>

  {/* PLAN IMAGE */}
  {c.plan?.image && (
    <img
  src={c.plan.image}
  alt="plan"
  onClick={() => setPreviewImage(c.plan?.image || null)}
  className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-sm cursor-pointer hover:scale-105 transition"
/>
  )}

</div>
  </div>

  {/* BUTTONS */}
  <div className="flex gap-2 mt-4">

    <button
      onClick={() => editCustomer(c)}
      className="flex-1 py-2 text-xs rounded-lg bg-[#2563eb] text-white font-medium"
    >
      Edit
    </button>

    <button
      onClick={() => renewCustomer(c.id)}
      className="flex-1 py-2 text-xs rounded-lg bg-[#7c3aed] text-white font-medium"
    >
      Renew
    </button>

    <button
      onClick={() => setDeleteId(c.id)}
      className="flex-1 py-2 text-xs rounded-lg bg-[#dc2626] text-white font-medium"
    >
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