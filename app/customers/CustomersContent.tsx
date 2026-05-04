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

  const [showModal, setShowModal] = useState(false);
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
    <div className="min-h-screen p-3 md:p-6 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-5 items-center">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800">
            Customers
          </h1>

          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full"
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
                className="p-[2px] rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500"
              >
                <div className="bg-white p-4 rounded-2xl flex justify-between items-center">

                  {/* LEFT */}
                  <div>
                    <h2 className="font-semibold">{c.name}</h2>
                    <p className="text-sm text-gray-600">{c.phone}</p>
                    <p className="text-xs text-indigo-600">
                      OTT: {c.ottNumber || "-"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Exp: {new Date(c.expiryDate).toLocaleDateString()}
                    </p>

                    {/* STATUS */}
                    <span
                      className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold ${
                        expired
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {expired ? "Expired" : "Active"}
                    </span>
                  </div>

                  {/* RIGHT BUTTONS */}
                  <div className="flex gap-2 flex-wrap justify-end">

                    <button
                      onClick={() => editCustomer(c)}
                      className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => renewCustomer(c.id)}
                      className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                    >
                      Renew
                    </button>

                    <button
                      onClick={() => setDeleteId(c.id)}
                      className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md"
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
    </div>
  );
}