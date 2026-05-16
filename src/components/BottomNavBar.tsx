"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavBar() {
  const pathname = usePathname();

  // Hide navigation bar on authentication and setup screens
  if (pathname === "/login" || pathname === "/setup" || pathname?.startsWith("/login") || pathname?.startsWith("/setup")) {
    return null;
  }

  const navItems = [
    { href: "/", icon: "dashboard", label: "Dashboard", filledIcon: true },
    { href: "/customers", icon: "group", label: "Customers", filledIcon: false },
    { href: "/ledger", icon: "receipt_long", label: "Ledger", filledIcon: false },
    { href: "/reports", icon: "analytics", label: "Reports", filledIcon: false },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-50 pointer-events-auto">
      <nav className="flex justify-around items-center px-2 py-2 bg-surface/85 dark:bg-surface-dim/85 backdrop-blur-xl border border-outline-variant/40 shadow-[0_10px_35px_rgba(0,0,0,0.2)] rounded-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center transition-all duration-300 py-1.5 px-3 rounded-full relative group cursor-pointer active:scale-95 ${
                isActive
                  ? "bg-gradient-to-tr from-primary to-primary-container text-on-primary font-bold shadow-md scale-105"
                  : "text-on-surface-variant dark:text-outline hover:text-on-surface hover:bg-surface-container-highest/50"
              }`}
            >
              <div className="flex items-center justify-center mb-0.5">
                <span 
                  className="material-symbols-outlined text-[22px] transition-transform duration-300 group-hover:scale-110" 
                  style={{ fontVariationSettings: isActive || item.filledIcon ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
              </div>
              <span className={`text-[11px] tracking-tight leading-none ${isActive ? "font-bold text-on-primary" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
