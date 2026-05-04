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
        <div className="bg-white/60 backdrop-blur-xl border-b px-4 py-3 flex items-center justify-center shadow-sm sticky top-0 z-40">
          <h1 className="font-semibold text-lg tracking-tight">
            OTT Manager
          </h1>
        </div>

        {/* 🔥 TOP NAV */}
        <div className="bg-white/50 backdrop-blur-xl border-b px-2 py-2 sticky top-[56px] z-30">
          <div className="flex gap-2 bg-white/40 p-1 rounded-xl shadow-inner">
            {menu.map((item) => {
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex-1 text-center py-2 text-sm font-medium rounded-lg transition-all duration-300
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md scale-[1.03]"
                      : "text-gray-700 hover:bg-white/60"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* 🔥 MOBILE CONTENT */}
        <main className="p-4">
          {children}
        </main>
      </div>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-64 bg-white/30 backdrop-blur-xl border-r border-white/20 p-6">

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