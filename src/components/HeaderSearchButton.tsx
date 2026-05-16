"use client";

import { useRouter, usePathname } from "next/navigation";

export default function HeaderSearchButton() {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    if (pathname === "/customers") {
      const input = document.getElementById("customer-search-input");
      if (input) {
        input.focus();
      }
    } else {
      router.push("/customers");
    }
  };

  return (
    <button 
      onClick={handleClick}
      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-all active:scale-90 duration-200 bg-surface-container-lowest shadow-sm border border-outline-variant/50 cursor-pointer text-on-surface-variant"
      title="Search Customers"
      aria-label="Search"
    >
      <span className="material-symbols-outlined text-[20px]">search</span>
    </button>
  );
}
