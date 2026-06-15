"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  CreditCard,
  Users,
  Bell,
  Menu,
} from "lucide-react";
import { motion } from "framer-motion";


export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

const menu = [
  { name: "Dashboard", path: "/", icon: LayoutGrid },
  { name: "Plans", path: "/plans", icon: CreditCard },
  { name: "Customers", path: "/customers", icon: Users },
];

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">

      {/* ================= MOBILE UI ================= */}
      <div className="w-full md:hidden bg-gradient-to-br
from-[#F7F7FB]
via-[#F2F4FF]
to-[#F9F6FF] min-h-screen">

        {/* MOBILE HEADER */}
<div className="bg-transparent pt-5 pb-3">

  <div className="px-6 flex items-center justify-between">

    <button>
      <Menu
        size={22}
        strokeWidth={2}
        className="
text-slate-500
drop-shadow-[0_8px_30px_rgba(31,38,135,0.08)]
"
      />
    </button>

    <h1
      className="
      text-[18px]
      font-bold
      tracking-tight
      text-[#0B1437]
      "
    >
      OTT Manager
    </h1>

    <button className="relative">

      <Bell
        size={22}
        strokeWidth={1.8}
        className="
text-slate-500
drop-shadow-[0_8px_30px_rgba(31,38,135,0.08)]
"
      />

      <span
        className="
        absolute
        top-[2px]
        right-[2px]
        w-2.5
        h-2.5
        rounded-full
        bg-red-500
shadow-[0_0_8px_rgba(239,68,68,0.8)]
        "
      />
    </button>

  </div>

</div>

<div className="px-7 pb-2">

  <div
    className="
    bg-white/55
backdrop-blur-xl
border
border-white/60
backdrop-blur-xl
border
border-white/50
    rounded-[18px]
    shadow-[0_15px_40px_rgba(124,58,237,0.10)]
    h-[52px]
    flex
    items-center
    relative
    "
  >

    {menu.map((item, index) => {
      <div
  className="
  absolute
  inset-0
  bg-gradient-to-b
  from-white/60
  via-white/20
  to-transparent
  pointer-events-none
  "
/>
      const Icon = item.icon;
      const isActive = pathname === item.path;

      return (
        
        <div
          key={item.name}
          className="
          flex-1
          relative
          h-full
          "
        >
          <Link
            href={item.path}
            className="
            flex
            flex-col
            items-center
            justify-center
            h-full
            "
          >
            <Icon
              size={18}
              strokeWidth={1.8}
              className={
                isActive
                  ? "text-[#6D5DFD] drop-shadow-[0_8px_30px_rgba(31,38,135,0.08)]"
                  : "text-slate-500"
              }
            />

            <span
              className={
                isActive
                  ? "text-[#7B61FF] text-[10px] font-bold mt-2"
                  : "text-slate-500 text-[10px] font-bold mt-2"
              }
            >
              {item.name}
            </span>

    {isActive && (
  <motion.div
    layoutId="liquidTab"
    className="
    absolute
    bottom-0
    left-3
    right-3
    h-[4px]
    rounded-full
    bg-gradient-to-r
    from-violet-500
    to-indigo-500
    shadow-[0_0_20px_rgba(124,58,237,0.6)]
    "
    transition={{
      type: "spring",
      stiffness: 500,
      damping: 35,
    }}
  />
)}
          </Link>

          {index !== menu.length - 1 && (
            <div
              className="
              absolute
              right-0
              top-1/2
              -translate-y-1/2
              h-9
              w-px
              bg-slate-200
              "
            />
          )}
        </div>
      );
    })}
  </div>

</div>

        {/* 🔥 MOBILE CONTENT */}
        <main className="bg-[#F6F2FF] min-h-screen">
          {children}
        </main>
      </div>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-72 bg-white/55
backdrop-blur-xl
border
border-white/60 border-r border-white/20 p-8">

        <h2 className="text-[20px] font-bold mb-10 tracking-tight">
          OTT Manager
        </h2>

        <nav className="flex flex-col gap-3">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-white/55 backdrop-blur-xl border border-white/60"
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ================= DESKTOP CONTENT ================= */}
      <div className="hidden md:block flex-1 p-6">
        {children}
      </div>
    </div>
  );
}