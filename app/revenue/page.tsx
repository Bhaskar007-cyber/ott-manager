"use client";

import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  Download,
  Wallet,
  Users,
  TrendingUp,
} from "lucide-react";

const chartData = [
  { day: "Jun 1", revenue: 40 },
  { day: "Jun 2", revenue: 70 },
  { day: "Jun 3", revenue: 150 },
  { day: "Jun 4", revenue: 200 },
  { day: "Jun 5", revenue: 320 },
  { day: "Jun 6", revenue: 900 },
  { day: "Jun 7", revenue: 320 },
];

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

  const chartData = plans.map((plan) => {
  const users = customers.filter(
    (c) => c.planId === plan.id
  );
  return {
    day: `Plan ${plan.id}`,
    revenue: users.length * plan.price,
  };

});

  // PLAN REVENUE
  

  return (
  <div className="p-4 md:p-8 min-h-screen bg-[#F7F8FC]">

    {/* HEADER */}
    <div className="flex justify-between items-center mb-6">

      <h1 className="text-l font-bold">
        Revenue Dashboard
      </h1>

      <div className="flex gap-3">

        <select className="bg-white border border-slate-200 rounded-xl px-2 py-1">
          <option>This Month</option>
        </select>

       

      </div>
    </div>

    {/* TOP CARDS */}

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-4 flex justify-between items-center">

        <div>
          <p className="text-xs opacity-90">
  Total Revenue
</p>
          <h2 className="text-2xl font-bold">
            ₹{totalRevenue}
          </h2>
        </div>

        <Wallet size={24}/>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-3 flex justify-between items-center">

        <div>
          <p>Total Customers</p>
          <h2 className="text-xl font-bold">
            {customers.length}
          </h2>
        </div>

        <Users size={24}/>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-4 flex justify-between items-center">

        <div>
          <p>Avg Revenue / User</p>
          <h2 className="text-xl font-bold">
            ₹{
              customers.length
                ? Math.floor(totalRevenue / customers.length)
                : 0
            }
          </h2>
        </div>

        <TrendingUp size={24}/>
      </div>

    </div>

    {/* REVENUE CHART */}

    <div className="bg-white rounded-3xl p-3 shadow-sm mb-6">

      <h2 className="font-semibold text-xl mb-6">
        Revenue Overview
      </h2>

      <div className="h-[350px]">

        <ResponsiveContainer width="100%" height="100%">

          <BarChart data={chartData}>

            <XAxis dataKey="day"/>

            <YAxis/>

            <Tooltip/>

            <Bar
              dataKey="revenue"
              fill="#7C3AED"
              radius={[8,8,0,0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>

    {/* TOP CUSTOMERS */}

    <div className="bg-white rounded-3xl p-3 shadow-sm">

      <div className="flex justify-between items-center mb-5">

  <h2 className="font-semibold text-xl">
    Top Customers
  </h2>

  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
    {customers.length} Users
  </span>

</div>

<div className="space-y-4">

{[...customers]
  .sort((a, b) => {
    const planA = plans.find((p) => p.id === a.planId);
    const planB = plans.find((p) => p.id === b.planId);

    return (planB?.price || 0) - (planA?.price || 0);
  })
  .map((c, index) => {

    const plan = plans.find(
      (p) => p.id === c.planId
    );

    return (

<div
  key={c.id}
  className="
bg-gradient-to-r
from-white
to-slate-50
border
border-slate-200
rounded-2xl
p-4
flex
justify-between
items-center
shadow-sm
hover:shadow-xl
transition-all
duration-300
w-full
"
>

        <div className="flex items-center gap-3">

          <div
            className="
            w-8
            h-8
            rounded-full
            bg-purple-100
            text-purple-600
            flex
            items-center
            justify-center
            font-bold
            "
          >
            {index + 1}
          </div>

          <div>
            <p className="font-semibold text-slate-900">
              {c.name}
            </p>

            <p className="text-xs text-slate-500">
              {plan?.name}
            </p>
          </div>

        </div>

        <div
          className="
          px-3
          py-1
          rounded-full
          bg-purple-100
          text-purple-700
          font-bold
          "
        >
          ₹{plan?.price || 0}
        </div>

      </div>

    );
})}

</div>


    </div>

  </div>
);
}