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

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [planId, setPlanId] = useState("");
  const [ottNumber, setOttNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  // ✅ SINGLE fetch (FIXED — removed duplicate)
  const fetchData = async () => {
    try {
      const res = await fetch("/api/dashboard", {
        cache: "no-store",
      });

      const data = await res.json();

      setCustomers(data.customers || []);
      setPlans(data.plans || []);
    } catch (err) {
      console.error("Fetch error:", err);
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

  const uniquePlans = Array.from(
    new Map(plans.map((p) => [p.name, p])).values()
  );

  const filteredCustomers = customers.filter((c) => {
    const isExpired = new Date(c.expiryDate) < new Date();

    if (status === "active") return !isExpired;
    if (status === "expired") return isExpired;

    return true;
  });

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

  const deleteCustomer = async (id: number) => {
    if (!confirm("Delete this customer?")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    fetchData();
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

  return <div>Customers loaded successfully ✅</div>;
}