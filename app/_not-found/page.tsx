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
    <div>
      <h1>Página não encontrada</h1>
      <p>A página que você está procurando não existe.</p>
    </div>
  );
}