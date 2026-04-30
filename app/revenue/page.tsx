"use client";

import { useEffect, useState } from "react";

// TYPES
type Customer = {
  id: number;
  name: string;
  planId: number;
};

type Plan = {
  id: number;
  name: string;
  price: number;
};

export default function RevenuePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const load = async () => {
      const c = await fetch("/api/customers").then((r) => r.json());
      const p = await fetch("/api/plans").then((r) => r.json());

      setCustomers(c);
      setPlans(p);
    };

    load();
  }, []);

  // TOTAL
  const totalRevenue = customers.reduce((total, c) => {
    const plan = plans.find((p) => p.id === c.planId);
    return total + (plan?.price || 0);
  }, 0);

  // PLAN REVENUE
  const planRevenue = plans.map((p) => {
    const users = customers.filter((c) => c.planId === p.id);
    return {
      name: p.name,
      total: users.length * p.price,
      users: users.length,
    };
  });

  return (
    <div className="p-6 min-h-screen text-black">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6">
        Revenue Dashboard
      </h1>

      {/* 🔥 TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="p-6 rounded-2xl text-white shadow-xl bg-gradient-to-r from-blue-500 to-indigo-600">
          <p className="opacity-80 text-sm">Total Revenue</p>
          <h2 className="text-3xl font-bold">₹{totalRevenue}</h2>
        </div>

        <div className="p-6 rounded-2xl text-white shadow-xl bg-gradient-to-r from-purple-500 to-pink-500">
          <p className="opacity-80 text-sm">Total Customers</p>
          <h2 className="text-3xl font-bold">{customers.length}</h2>
        </div>

        <div className="p-6 rounded-2xl text-white shadow-xl bg-gradient-to-r from-green-500 to-emerald-600">
          <p className="opacity-80 text-sm">Avg Revenue / User</p>
          <h2 className="text-3xl font-bold">
            ₹{customers.length ? Math.floor(totalRevenue / customers.length) : 0}
          </h2>
        </div>

      </div>

      {/* 🔥 CUSTOMER CARDS */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/30 p-5 rounded-2xl shadow-lg mb-6">
        <h2 className="font-semibold mb-4 text-lg">
          Customer Revenue
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {customers.map((c) => {
            const plan = plans.find((p) => p.id === c.planId);

            return (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-white/40 
                bg-white/60 backdrop-blur-md 
                hover:bg-white/80 hover:shadow-lg hover:scale-[1.01] 
                transition duration-300 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-gray-700">
                    {plan?.name}
                  </p>
                </div>

                <span className="font-bold text-indigo-600">
                  ₹{plan?.price || 0}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🔥 PLAN PERFORMANCE */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/30 p-5 rounded-2xl shadow-lg">
        <h2 className="font-semibold mb-4 text-lg">
          Plan Performance
        </h2>

        <div className="space-y-4">
          {planRevenue.map((p, i) => {
            const percent =
              totalRevenue === 0
                ? 0
                : (p.total / totalRevenue) * 100;

            const isTop = percent > 40;

            return (
              <div
                key={i}
                className={`p-[1.5px] rounded-xl transition ${
                  isTop
                    ? "bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 shadow-lg"
                    : "bg-white/30"
                }`}
              >
                <div className="p-4 rounded-xl bg-white/70 backdrop-blur-md hover:bg-white/90 transition">

                  {/* TOP ROW */}
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {p.users} users
                      </p>
                    </div>

                    <span className="font-bold text-indigo-600">
                      ₹{p.total}
                    </span>
                  </div>

                  {/* PROGRESS */}
                  <div className="w-full bg-white/40 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 
                      shadow-[0_0_10px_rgba(139,92,246,0.6)] transition-all duration-700"
                      style={{ width: `${percent}%` }}
                    />
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