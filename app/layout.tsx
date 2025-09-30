import "./globals.css";
import Image from "next/image";
import Sidebar from "./sidebar";

export const metadata = {
  title: "Controle Eventos Andiamo",
  description: "Exemplo Next.js com menu e páginas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="flex h-screen">
        {/* MENU LATERAL */}
        <Sidebar />

        {/* CONTEÚDO DA PÁGINA */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
