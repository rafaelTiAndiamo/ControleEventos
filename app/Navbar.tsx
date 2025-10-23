"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText, LogOut, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/ui/UserContext";
import { useAuthUser } from "@/hooks/useAuthUser";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

const capitalizeFirstLetter = (str: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

export default function Navbar() {
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const router = useRouter();
  const { email, setUser } = useUser();
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

  return (
    <header className="w-full bg-andiamo text-white flex flex-wrap items-center justify-between px-6 py-4 shadow-xl">
      <div className="flex items-center space-x-8">
        <Image src="/logoAndiamo.png" alt="Logo" width={200} height={50} />
      </div>

      <div className="flex items-center space-x-4">
        <Image src="/logoAndiamo.png" alt="Logo" width={200} height={50} />
      </div>
    </header>
  );
}