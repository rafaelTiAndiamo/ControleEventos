// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { UserProvider } from "@/components/ui/UserContext";
import AppLayout from "./appLayout"; // <-- componente cliente

export const metadata = {
  title: "Meu App",
  description: "Sistema com painel e autenticação",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-400">
        <UserProvider>
          <AppLayout>{children}</AppLayout>
        </UserProvider>
      </body>
    </html>
  );
}
