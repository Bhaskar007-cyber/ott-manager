"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Users,
} from "lucide-react";

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Plans", path: "/plans", icon: CreditCard },
    { name: "Customers", path: "/customers", icon: Users },
  ];

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">

      {/* ================= MOBILE UI ================= */}
      <div className="w-full md:hidden">

        {/* 🔥 HEADER */}
        <div
  className="
  bg-[#F8F8FC]
  h-[40px]
  flex
  items-center
  justify-center
  border-b
  border-slate-200
  "
>
  <h1 className="text-2xl font-bold text-slate-900">
    OTT Manager
  </h1>
</div>

        {/* 🔥 TOP NAV */}
        <div
  className="
  bg-white
  px-3
  py-2.5
  border-b
  border-slate-200
  shadow-sm
  "
>
          <div className="flex gap-3">
            {menu.map((item) => {
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-2xl font-semibold transition-all
${
  isActive
    ? "bg-[#E8EEFF] text-[#2563EB]"
    : "text-slate-500"
}`}
                >
                  <>
  <item.icon size={18} />
  <span>{item.name}</span>
</>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 🔥 MOBILE CONTENT */}
        <main className="px-1">
          {children}
        </main>
      </div>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-white/20 p-8">

        <h2 className="text-xl font-bold mb-10 tracking-tight">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-white/50"
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