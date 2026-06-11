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

type WifiPlan = {
  id: number;
  name: string;
  speed: string;
  image: string;
  hiddenImage?: string;
};

// ✅ COMPACT CARD
type CardProps = {
  title: string;
  value: string | number;
  gradient: string;
  link: string;
};

function Card({ title, value, gradient, link }: CardProps) {
  return (
    <Link href={link}>
      <div
        className={`p-3 md:p-5 rounded-xl md:rounded-2xl text-white shadow-lg 
        hover:scale-105 active:scale-95 transition ${gradient}`}
      >
        <p className="text-xs md:text-sm opacity-80">{title}</p>
        <h2 className="text-lg md:text-3xl font-bold">{value}</h2>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
const [plans, setPlans] = useState<Plan[]>([]);
const [wifiPlans, setWifiPlans] = useState<WifiPlan[]>([]);
const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      const data = await res.json();

      setCustomers(data.customers || []);
      setPlans(data.plans || []);

      const wifiRes = await fetch("/api/wifi");
const wifiData = await wifiRes.json();

setWifiPlans(wifiData || []);

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
    const diff = new Date(date).getTime() - today.getTime();
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

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-3 md:p-6 min-h-screen">

      <h1 className="text-xl md:text-3xl font-bold mb-4 md:mb-6">
        Dashboard
      </h1>

      {/* CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-5">
        <Card title="Revenue" value={`₹${revenue}`} gradient="bg-blue-600" link="/revenue" />
        <Card title="Customers" value={customers.length} gradient="bg-gray-600" link="/customers" />
        <Card title="Active" value={active.length} gradient="bg-green-600" link="/customers?status=active" />
        <Card title="Expired" value={expired.length} gradient="bg-red-600" link="/customers?status=expired" />
        <Card title="WiFi Plans" value={wifiPlans.length} gradient="bg-cyan-600" link="/wifi"/>
      </div>

      {/* CHART */}
      <div className="bg-white/70 backdrop-blur-xl p-3 md:p-5 rounded-xl md:rounded-2xl shadow mb-5">
        <h2 className="font-semibold text-sm md:text-lg mb-3">
          Revenue Analytics
        </h2>

        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              strokeWidth={2}
              stroke="#6366f1"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* LOWER */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* EXPIRING */}
        <div className="bg-white/70 backdrop-blur-xl p-3 md:p-5 rounded-xl md:rounded-2xl shadow">
          <h2 className="text-sm md:text-lg font-semibold mb-3">
            Expiring Soon
          </h2>

          {expiringSoon.length === 0 ? (
            <p className="text-xs text-gray-500">No expiries</p>
          ) : (
            expiringSoon.map((c) => {
              const days = getDaysLeft(c.expiryDate);

              return (
                <div
                  key={c.id}
                  className="flex justify-between items-center p-2 md:p-3 rounded-lg hover:bg-white/50 mb-2"
                >
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-[10px] text-gray-500">
                      {new Date(c.expiryDate).toLocaleDateString()}
                    </p>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                    {days}d
                  </span>
                </div>
              );
            })
          )}
          {/* WIFI PLANS */}
<div className="col-span-full">
  <h2 className="text-lg font-bold mb-4 mt-4">
    WiFi Plans
  </h2>

  <div className="grid md:grid-cols-2 gap-4">
    {wifiPlans.map((plan) => (
      <div
        key={plan.id}
        className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow"
      >
        <img
          src={plan.image}
          className="w-full h-40 object-cover rounded-xl"
        />

        {plan.hiddenImage && (
          <img
            src={plan.hiddenImage}
            className="w-full h-40 object-cover rounded-xl blur-md mt-3"
          />
        )}

        <div className="mt-3">
          <h3 className="font-bold">
            {plan.name}
          </h3>

          <p className="text-blue-600">
            {plan.speed}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>
        </div>

        {/* PLANS */}
        <div className="space-y-2">
  {plans.map((p) => (
    <div
      key={p.id}
      className="flex justify-between items-center bg-white/80 backdrop-blur-md px-3 py-3 rounded-xl shadow-sm border border-gray-100"
    >
      <div className="flex flex-col max-w-[75%]">
       <span className="text-[12px] md:text-sm font-semibold text-gray-900 leading-snug tracking-tight">
  {p.name}
</span>

        <span className="text-[10px] text-gray-400">
          Subscription plan
        </span>
      </div>

      <span className="text-indigo-600 font-semibold text-sm md:text-base whitespace-nowrap">
        ₹{p.price}
      </span>
    </div>
  ))}
</div>

      </div>
    </div>
  );
}