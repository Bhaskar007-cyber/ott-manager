"use client";
import { CartesianGrid,} from "recharts";
import { useEffect, useState } from "react";
import {Area,AreaChart,} from "recharts";
import {TrendingUp,Users,CheckCircle,Clock3,Wifi,} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {LineChart,  Line,XAxis,YAxis,Tooltip,ResponsiveContainer,} from "recharts";


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
  image: string;
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
  icon: React.ReactNode;
  iconColor: string;
  link: string;
};

function Card({
  title,
  value,
  icon,
  iconColor,
  link,
}: CardProps) {
  return (
    <Link href={link}>
      <div
        className="
        bg-white/95
        border
        border-slate-100
       rounded-2xl
shadow-sm
p-4
        hover:shadow-lg
        transition
        "
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">
              {title}
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
              {value}
            </h2>
            <p className="text-xs text-green-500 mt-2">
  Overview
</p>
          </div>

          <div className={`${iconColor} opacity-80`}>
  {icon}
</div>
        </div>
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
      console.log("PLANS DATA", data.plans);
      console.log(plans);

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
    console.log(plans);
  return (
    
    <div className="min-h-screen bg-[#F6F7FB] p-4 md:p-6 mt-2">

      <div className="mb-6">
  <div className="flex items-center justify-between">
  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
  Dashboard
</h1>

<div className="flex items-center gap-3">
  <div className="relative">
    <input
      type="text"
      placeholder="Search anything..."
      className="
      w-[110px]
      h-10
      bg-white
      rounded-xl
      border
      border-slate-200
      shadow-sm
      pl-11
      pr-4
      text-sm
      outline-none
      "
    />

    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
      🔍
    </span>
  </div>

  <button
    className="
    relative
    w-10
    h-10
    bg-white
    rounded-2xl
    border
    border-slate-200
    shadow-sm
    flex
    items-center
    justify-center
    "
  >
    <span className="text-lg text-slate-500">
      🔔
    </span>

    <span
      className="
      absolute
      top-2
      right-2
      w-2
      h-2
      rounded-full
      bg-purple-500
      "
    />
  </button>
</div>
</div>
</div>

      {/* CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-5">

<Card
  title="Revenue"
  value={`₹${revenue}`}
  icon={<TrendingUp size={34} />}
  iconColor="text-purple-500"
  link="/revenue"
/>

<Card
  title="Customers"
  value={customers.length}
  icon={<Users size={34} />}
  iconColor="text-indigo-500"
  link="/customers"
/>

<Card
  title="Active"
  value={active.length}
  icon={<CheckCircle size={34} />}
  iconColor="text-green-500"
  link="/customers?status=active"
/>

<Card
  title="Expired"
  value={expired.length}
  icon={<Clock3 size={34} />}
  iconColor="text-red-500"
  link="/customers?status=expired"
/>

<div className="col-span-2 xl:col-span-1">
<Card
 title="WiFi Plans"
 value={wifiPlans.length}
 icon={<Wifi size={34} />}
 iconColor="text-blue-500"
 link="/wifi"
/>
</div>
</div>

      

{/* ANALYTICS + EXPIRING */}
<div className="grid grid-cols-1 lg:grid-cols-[4fr_1.2fr] gap-6 mb-6">

  {/* REVENUE CHART */}
 <div
  className="
  bg-white
  border
  border-slate-100
  rounded-2xl
  shadow-sm
  p-3 md:p-4
  hover:shadow-md
  transition
  "
>
    <div className="flex justify-between mb-4">
      <h2 className="font-semibold">
        Revenue Analytics
      </h2>

      <select className="border rounded-lg px-3 py-1">
        <option>This Week</option>
      </select>
    </div>

    <div className="h-[240px] md:h-[340px]">
  <ResponsiveContainer width="100%" height="100%">

  <AreaChart data={chartData}>
    <defs>
      <linearGradient
        id="colorRevenue"
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop
          offset="5%"
          stopColor="#6C63FF"
          stopOpacity={0.35}
        />
        <stop
          offset="95%"
          stopColor="#6C63FF"
          stopOpacity={0}
        />
      </linearGradient>
    </defs>

    <XAxis
  dataKey="name"
  tickLine={false}
  axisLine={false}
/>

<YAxis
  tickLine={false}
  axisLine={false}
/>

<CartesianGrid
  strokeDasharray="3 3"
  vertical={false}
/>

    <Tooltip />

    <Area
      type="monotone"
      dataKey="revenue"
      stroke="#6C63FF"
      fill="url(#colorRevenue)"
      strokeWidth={3}
    />
  </AreaChart>
</ResponsiveContainer>
  </div>
  </div>

  {/* EXPIRING SOON */}
    <div className="bg-white rounded-2xl p-5 shadow-sm">
  <h2 className="font-semibold text-lg mb-4">
    Expiring Soon
  </h2>

  {expiringSoon.length === 0 ? (
    <p className="text-gray-500">
      No expiries
    </p>
  ) : (
    expiringSoon.map((c) => {
      const days = getDaysLeft(c.expiryDate);

      return (
        <div
          key={c.id}
          className="flex justify-between items-center py-3 border-b last:border-b-0"
        >
          <div>
            <p className="font-medium">
              {c.name}
            </p>

            <p className="text-sm text-gray-500">
              {new Date(
                c.expiryDate
              ).toLocaleDateString()}
            </p>
          </div>

          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs">
            {days}d
          </span>
        </div>
      );
    })
  )}
  <Link
 href="/customers"
 className="
 mt-5
 block
 text-center
 bg-gradient-to-r
 from-blue-600
 to-purple-600
 text-white
 py-3
 rounded-xl
 font-medium
 "
>
 View All Customers
</Link>
</div>
</div>

{/* RECENT PLANS */}
<div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm">
  <div className="flex justify-between items-center mb-4">
    <h2 className="font-semibold text-lg">
      Recent Plans
    </h2>

    <Link
      href="/plans"
      className="text-indigo-600 font-medium"
    >
      View All
    </Link>
  </div>

<div
  className="
  flex
  md:grid
  md:grid-cols-4
  md:gap-5
  gap-3
  overflow-x-auto
  md:overflow-visible
  pb-2
  scrollbar-hide
  "
>
    {plans.slice(0, 5).map((p) => (
<div
  key={p.id}
  className="
w-[160px]
md:w-full
min-h-[110px]
flex-shrink-0
bg-white
rounded-xl
border
border-slate-100
p-1
shadow-sm
"
>
  <Image
    src={p.image}
    alt={p.name}
    width={40}
    height={32}
    className="mb-2"
  />

  <div className="text-[13px] font-semibold truncate">
    {p.name}
  </div>

  <div className="text-indigo-600 font-bold mt-1">
    ₹{p.price}
  </div>

    <div className="text-xs text-gray-400 mt-1">
      Subscription Plan
    </div>
  </div>
))}
  </div>
</div>
</div>
  );
}
      