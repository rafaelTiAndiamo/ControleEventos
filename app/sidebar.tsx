"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText, Users, Calendar, Package, ClipboardList } from "lucide-react";

import { useRouter } from "next/navigation";

export default function Sidebar() {
  const [active, setActive] = useState("Proposta");

  const menuItems = [
    { name: "Proposta", icon: <FileText className="w-5 h-5" /> },
    
  ];

  // dentro do componente Sidebar
const router = useRouter();

  return (
    <aside className="w-64 bg-andiamo text-white flex flex-col p-6">
      <Image
        src="/logoAndiamo.png"
        alt="Logo"
        width={180}
        height={60}
        className="mb-8"
      />

      <nav className="flex flex-col space-y-2">
        {menuItems.map((item) => (
                <button
                    key={item.name}
                    onClick={() => {
                    setActive(item.name);      // mantém o highlight ativo
                    router.push(item.name ? "formulario" : "");     // navega para a rota correspondente
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors
                    ${
                        active === item.name
                        ? "bg-black text-andiamo font-semibold"
                        : "hover:bg-white/500"
                    }`}
                >
                    {item.icon}
                    <span>{item.name}</span>
                </button>
                ))}
      </nav>
    </aside>
  );
}
