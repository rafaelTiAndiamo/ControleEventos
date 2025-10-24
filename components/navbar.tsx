"use client";

import Image from "next/image";


import { useUser } from "@/components/ui/UserContext";
import { useAuthUser } from "@/hooks/useAuthUser";




export default function Navbar() {
  

  const { email, setUser } = useUser();
  const { userData } = useAuthUser();

  

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