// app/_not-found/page.tsx
"use client"; // Garante que a página roda no lado do cliente

import { useEffect } from "react";
import { auth } from "@/lib/firebaseConfig";

export default function NotFound() {
  useEffect(() => {
    if (auth) {
      console.log("Auth disponível:", auth);
    }
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">Página não encontrada</h1>
        <p className="text-gray-600 mt-4">A página que você está procurando não existe.</p>
      </div>
    </div>
  );
}