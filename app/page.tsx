"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// TYPES
type Customer = {
  id: number;
  name: string;
  expiryDate: string;
  planId: number;
};

type Plan = {
  id: number;
  name: string;
  price: number;
};

// 🔥 PREMIUM CARD
function Card({
  title,
  value,
  gradient,
  link,
}: {
  title: string;
  value: string | number;
  gradient: string;
  link: string;
}) {
  return (
    <Link href={link}>
      <div
        className={`p-5 rounded-2xl text-white shadow-lg transition-all duration-300 
        hover:scale-105 active:scale-95 cursor-pointer ${gradient}`}
      >
        <p className="text-sm opacity-80">{title}</p>
        <h2 className="text-3xl font-bold">{value}</h2>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/dashboard", {
        cache: "no-store",
      });

      const data = await res.json();

      setCustomers(data.customers || []);
      setPlans(data.plans || []);
    } catch (err) {
      console.error("Dashboard error:", err);
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

  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const expiringSoon = customers
    .filter((c) => {
      const exp = new Date(c.expiryDate);
      return exp >= today && exp <= nextWeek;
    })
    .sort(
      (a, b) =>
        new Date(a.expiryDate).getTime() -
        new Date(b.expiryDate).getTime()
    );

  const getDaysLeft = (date: string) => {
    const diff =
      new Date(date).getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const active = customers.filter(
    (c) => new Date(c.expiryDate) >= today
  );

  const expired = customers.filter(
    (c) => new Date(c.expiryDate) < today
  );

  const revenue = customers.reduce((total, c) => {
    const plan = plans.find((p) => p.id === c.planId);
    return total + (plan?.price || 0);
  }, 0);

  const chartData = plans.map((p) => {
    const count = customers.filter((c) => c.planId === p.id).length;
    return {
      name: p.name,
      revenue: count * p.price,
    };
  });

  // 🔥 LOADING UI (FIXED)
  if (loading) {
    return (
      <div className="p-6 min-h-screen animate-pulse">
        <div className="h-8 w-40 bg-white/40 rounded mb-6"></div>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/40 rounded-2xl"></div>
          ))}
        </div>

        <div className="h-72 bg-white/40 rounded-2xl mb-6"></div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-40 bg-white/40 rounded-2xl"></div>
          <div className="h-40 bg-white/40 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card
          title="Revenue"
          value={`₹${revenue}`}
          gradient="bg-gradient-to-r from-blue-500 to-blue-700"
          link="/revenue"
        />

        <Card
          title="Customers"
          value={customers.length}
          gradient="bg-gradient-to-r from-gray-500 to-gray-700"
          link="/customers"
        />

        <Card
          title="Active"
          value={active.length}
          gradient="bg-gradient-to-r from-green-500 to-green-700"
          link="/customers?status=active"
        />

        <Card
          title="Expired"
          value={expired.length}
          gradient="bg-gradient-to-r from-red-500 to-red-700"
          link="/customers?status=expired"
        />
      </div>

      {/* CHART */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/30 p-5 rounded-2xl shadow-lg mb-6">
        <h2 className="font-bold mb-4 text-lg">Revenue Analytics</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              strokeWidth={3}
              stroke="#6366f1"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* LOWER SECTION */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* EXPIRING */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/30 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4">
            Expiring in 7 Days
          </h2>

          {expiringSoon.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming expiries</p>
          ) : (
            expiringSoon.map((c) => {
              const days = getDaysLeft(c.expiryDate);

              return (
                <div
                  key={c.id}
                  className="flex justify-between items-center p-3 rounded-xl hover:bg-white/50 transition mb-2 border-l-4 border-yellow-400"
                >
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-gray-500">
                      Exp: {new Date(c.expiryDate).toLocaleDateString()}
                    </p>
                  </div>

                  <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                    {days} days
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* PLANS */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/30 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4">
            Plans
          </h2>

          <div className="space-y-3">
            {plans.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center p-4 rounded-xl border border-white/30 hover:bg-white/50 transition"
              >
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-gray-500">
                    Subscription Plan
                  </p>
                </div>

                <span className="text-lg font-bold text-indigo-600">
                  ₹{p.price}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}