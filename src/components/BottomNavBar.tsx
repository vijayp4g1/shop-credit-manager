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
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-gutter py-2 pb-safe bg-surface-container dark:bg-surface-container-lowest border-t border-outline-variant shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.04)] z-50 rounded-t-xl">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center transition-all active:scale-95 duration-200 py-2 w-16 ${
              isActive
                ? "text-on-secondary-container dark:text-on-secondary"
                : "text-on-surface-variant dark:text-outline hover:bg-surface-container-highest rounded-xl"
            }`}
          >
            <div className={`flex items-center justify-center rounded-full px-4 py-1 mb-1 transition-colors ${isActive ? "bg-secondary-container dark:bg-secondary" : ""}`}>
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: isActive || item.filledIcon ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
            </div>
            <span className={`text-[11px] leading-none ${isActive ? "font-bold" : "font-medium"}`}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
