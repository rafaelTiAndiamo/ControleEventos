"use client";

import { useAuthUser } from "@/hooks/useAuthUser";
import { useUser } from "@/components/ui/UserContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { FileText, LogOut, UserCircle2, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, FC } from "react";

export default function Sidebar() {
  const router = useRouter();
  const [active, setActive] = useState("Proposta");
  const { email, setUser } = useUser();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const { userData } = useAuthUser();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser("", "");
      router.push("/login");
    } catch (err) {
      setLogoutError("Erro ao deslogar. Tente novamente.");
    }
  };

  if (!email || !userData) return null;



const menuItems: { 
  name: string; 
  path: string; 
  icon: FC<{ className?: string }>; // tipagem do ícone
}[] = [
  { name: "Proposta", path: "/formulario", icon: FileText },
  { name: "Orçamentos", path: "/orcamentos", icon: CreditCard },
];

  return (
    <aside className="fixed top-0 left-0 w-56 h-screen  bg-white dark:bg-gray-900 shadow-xl flex flex-col">
      <div className="flex flex-col items-center bg-andiamo p-4 border-b border-gray-200 dark:border-gray-700">
        <UserCircle2 className="w-16 h-16 text-white dark:text-gray-300" />
        <span className="mt-2 font-semibold text-white dark:text-gray-200">
          {userData?.name || email}
        </span>
        <span className="text-xs text-gray-300 dark:text-gray-400">
          {userData?.group}
        </span>
      </div>

      <nav className="flex-1 flex flex-col mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon; // ✅ Pega o componente ícone do item
          return (
            <button
              key={item.name}
              onClick={() => {
                setActive(item.name);
                router.push(item.path);
              }}
              className={`flex items-center space-x-2 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-andiamo hover:text-white transition-colors ${
                active === item.name ? "bg-andiamo text-white" : ""
              }`}
            >
              <Icon className="w-5 h-5" />  {/* Agora funciona */}
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-andiamo hover:text-white rounded transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
        {logoutError && (
          <p className="text-red-400 text-xs mt-2">{logoutError}</p>
        )}
      </div>
    </aside>
  );
}