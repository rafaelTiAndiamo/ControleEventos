"use client";

import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import { useUser } from "@/components/ui/UserContext";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { email } = useUser();
  const pathname = usePathname(); // ✅ atualiza automaticamente quando a rota muda
  const isLoginPage = pathname === "/login";
  const isLoggedIn = !!email;

  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900 text-neutral-900">
      {!isLoginPage && <Navbar />}
      <div className="flex">
        {!isLoginPage && <Sidebar />}
        <main className={`flex-1 ${!isLoginPage ? "ml-56 p-6" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
