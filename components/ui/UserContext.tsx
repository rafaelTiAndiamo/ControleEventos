"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";

interface UserContextType {
  email: string;
  group: string;
  setUser: (email: string, group: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [group, setGroup] = useState("");
  const { user, userData } = useAuthUser();

  // Sincronizar com useAuthUser
  useEffect(() => {
    if (user && userData) {
      console.log("UserContext: Sincronizando com useAuthUser", { email: userData.email, group: userData.group });
      setEmail(userData.email || "");
      setGroup(userData.group || "");
    } else {
      console.log("UserContext: Nenhum usuário autenticado, limpando contexto");
      setEmail("");
      setGroup("");
    }
  }, [user, userData]);

  const setUser = (newEmail: string, newGroup: string) => {
    console.log("UserContext: Atualizando usuário", { newEmail, newGroup });
    setEmail(newEmail);
    setGroup(newGroup);
  };

  return (
    <UserContext.Provider value={{ email, group, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser deve ser usado dentro de um UserProvider");
  }
  return context;
}