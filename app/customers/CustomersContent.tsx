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
};

type Plan = {
  id: number;
  name: string;
};

export default function CustomersContent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [planId, setPlanId] = useState("");
  const [ottNumber, setOttNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      const res = await fetch("/api/dashboard", {
        cache: "no-store",
      });

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

    if (status === "active") return !expired;
    if (status === "expired") return expired;

    return true;
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

    await fetch(`/api/customers/${deleteId}`, {
      method: "DELETE",
    });

    setDeleteId(null);
    fetchData();
  };

  // ================= OTHER =================
  const resetForm = () => {
    setName("");
    setPhone("");
    setPlanId("");
    setOttNumber("");
    setStartDate("");
    setEditingId(null);
    setShowForm(false);
  };

  const editCustomer = (c: Customer) => {
    setName(c.name);
    setPhone(c.phone);
    setPlanId(String(c.planId));
    setOttNumber(c.ottNumber || "");
    setStartDate(c.startDate?.split("T")[0] || "");
    setEditingId(c.id);
    setShowForm(true);
  };

  const renewCustomer = async (id: number) => {
    const res = await fetch(`/api/customers/${id}/renew`, {
      method: "PUT",
    });

    if (!res.ok) {
      alert("Renew failed");
      return;
    }

    fetchData();
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-6 items-center">
          <h1 className="text-3xl font-bold text-gray-800">Customers</h1>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2 rounded-full shadow-lg hover:scale-105 transition"
          >
            + Add Customer
          </button>
        </div>

        {/* ADD / EDIT MODAL */}
        {showForm && (
          <div
            onClick={resetForm}
            className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-[420px] rounded-2xl p-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">

                <h2 className="text-lg font-semibold mb-4">
                  {editingId ? "Edit Customer" : "Add Customer"}
                </h2>

                <div className="space-y-3">

                  <input
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-xl border bg-white/70"
                  />

                  <input
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 rounded-xl border bg-white/70"
                  />

                  <input
                    placeholder="OTT Number"
                    value={ottNumber}
                    onChange={(e) => setOttNumber(e.target.value)}
                    className="w-full p-3 rounded-xl border bg-white/70"
                  />

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-3 rounded-xl border bg-white/70"
                  />

                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="w-full p-3 rounded-xl border bg-white/70"
                  >
                    <option value="">Select Plan</option>
                    {uniquePlans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  {errorMsg && (
                    <div className="text-red-600 text-sm">{errorMsg}</div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={saveCustomer}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl"
                    >
                      Save
                    </button>

                    <button
                      onClick={resetForm}
                      className="flex-1 bg-gray-200 py-3 rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {deleteId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl w-[320px] text-center">
              <h2 className="text-lg font-semibold mb-4">
                Delete this customer?
              </h2>

              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg"
                >
                  Delete
                </button>

                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 bg-gray-200 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIST */}
        {/* LIST */}
<div className="space-y-4">
  {filteredCustomers.map((c) => {
    const expired = new Date(c.expiryDate) < new Date();

    return (
      <div
        key={c.id}
        className="p-[2px] rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500"
      >
        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl flex justify-between items-center shadow-lg">

          {/* LEFT SIDE */}
          <div>
            <h2 className="font-semibold text-lg text-gray-900">
              {c.name}
            </h2>

            <p className="text-sm text-gray-600">{c.phone}</p>

            <p className="text-xs text-indigo-600">
              OTT: {c.ottNumber || "-"}
            </p>

            <p className="text-xs text-gray-500">
              Exp: {new Date(c.expiryDate).toLocaleDateString()}
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* STATUS */}
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                expired
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {expired ? "Expired" : "Active"}
            </span>

            {/* EDIT */}
            <button
              onClick={() => editCustomer(c)}
              className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
            >
              Edit
            </button>

            {/* RENEW */}
            <button
              onClick={() => renewCustomer(c.id)}
              className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition"
            >
              Renew
            </button>

            {/* DELETE */}
            <button
              onClick={() => setDeleteId(c.id)}
              className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
            >
              Delete
            </button>

          </div>

        </div>
      </div>
    );
  })}
</div>
      </div>
    </div>
  );
}